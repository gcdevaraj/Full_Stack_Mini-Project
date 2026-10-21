pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        DOCKERHUB_USER = 'devaraj74'
        FRONTEND_IMAGE = 'pulsetask-frontend'
        BACKEND_IMAGE = 'pulsetask-backend'
        IMAGE_TAG = ''
        SKIP_PIPELINE = 'false'
    }

    triggers {
        githubPush()
    }

    stages {
     
stage('Checkout') {
    steps {
        script {
            def commitMessage = sh(
                script: 'git log -1 --pretty=%B',
                returnStdout: true
            ).trim()

            def commitSha = sh(
                script: 'git rev-parse --verify HEAD',
                returnStdout: true
            ).trim()

            if (!(commitSha ==~ /[0-9a-fA-F]{40}/)) {
                error "Invalid Git commit SHA: '${commitSha}'"
            }

            env.IMAGE_TAG = "b${env.BUILD_NUMBER}-${commitSha.take(7)}"
            env.SKIP_PIPELINE =
                commitMessage.contains('[skip ci]') ? 'true' : 'false'

            echo "Docker image tag: ${env.IMAGE_TAG}"
            echo "Skip pipeline: ${env.SKIP_PIPELINE}"
        }
    }
}

        stage('Frontend Build and Test') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Build and Test') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                dir('backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw -B clean verify'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                dir('backend') {
                    withSonarQubeEnv('SonarQube') {
                        sh './mvnw -B org.sonarsource.scanner.maven:sonar-maven-plugin:5.7.0.6970:sonar -Dsonar.projectKey=pulsetask'
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qualityGate = waitForQualityGate()

                        if (qualityGate.status != 'OK') {
                            error "SonarQube quality gate failed: ${qualityGate.status}"
                        }
                    }
                }
            }
        }

       
stage('Build Docker Images') {
    when {
        expression { env.SKIP_PIPELINE != 'true' }
    }
    steps {
        script {
            def tag = env.IMAGE_TAG

            if (!tag?.trim()) {
                error 'IMAGE_TAG is empty. Check the Checkout stage.'
            }

            echo "Building Docker images with tag: ${tag}"

            sh """
                set -eu
                docker build -t ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${tag} ./frontend
                docker build -t ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${tag} ./backend
            """
        }
    }
}


       
stage('Push Docker Images') {
    when {
        expression { env.SKIP_PIPELINE != 'true' }
    }
    steps {
        script {
            def tag = env.IMAGE_TAG

            if (!tag?.trim()) {
                error 'IMAGE_TAG is empty. Check the Checkout stage.'
            }

            withCredentials([
                usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_TOKEN'
                )
            ]) {
                sh """
                    set -eu
                    set +x
                    printf '%s' "\$DH_TOKEN" |
                        docker login -u "\$DH_USER" --password-stdin
                    docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${tag}
                    docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${tag}
                    docker logout
                """
            }
        }
    }
}


        stage('Update Kubernetes Manifests') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-write-creds',
                        usernameVariable: 'GH_USER',
                        passwordVariable: 'GH_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        sed -i "s|image: devaraj74/pulsetask-frontend:.*|image: devaraj74/pulsetask-frontend:$IMAGE_TAG|" kubernetes/base/frontend.yaml

                        sed -i "s|image: devaraj74/pulsetask-backend:.*|image: devaraj74/pulsetask-backend:$IMAGE_TAG|" kubernetes/base/backend.yaml

                        grep -F "image: devaraj74/pulsetask-frontend:$IMAGE_TAG" kubernetes/base/frontend.yaml
                        grep -F "image: devaraj74/pulsetask-backend:$IMAGE_TAG" kubernetes/base/backend.yaml

                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@users.noreply.github.com"

                        git add kubernetes/base/frontend.yaml kubernetes/base/backend.yaml

                        if git diff --cached --quiet; then
                            echo "Manifests already use $IMAGE_TAG"
                            exit 0
                        fi

                        git commit -m "Update PulseTask images to $IMAGE_TAG [skip ci]"

                        AUTH_TOKEN=$(printf '%s:%s' "$GH_USER" "$GH_TOKEN" |
                            base64 | tr -d '\\n')

                        git -c http.extraheader="AUTHORIZATION: basic $AUTH_TOKEN" \
                            push origin HEAD:main
                    '''
                }
            }
        }

        stage('Docker Hub Image Retention') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        export RETENTION_USER="$DH_USER"
                        export RETENTION_TOKEN="$DH_TOKEN"

                        python3 - <<'PY'
import json
import os
import urllib.error
import urllib.parse
import urllib.request

namespace = "devaraj74"
repositories = [
    "pulsetask-frontend",
    "pulsetask-backend",
]

def request_json(url, method="GET", payload=None, token=None):
    data = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"

    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        url, data=data, headers=headers, method=method
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read()
        return json.loads(body) if body else {}

user = os.environ["RETENTION_USER"]
secret = os.environ["RETENTION_TOKEN"]

auth = request_json(
    "https://hub.docker.com/v2/auth/token",
    method="POST",
    payload={"identifier": user, "secret": secret},
)

token = auth.get("access_token")
if not token:
    raise RuntimeError("Docker Hub authentication did not return an access token.")

retained = {}

for repository in repositories:
    print(f"Checking Docker Hub repository: {repository}")

    url = (
        f"https://hub.docker.com/v2/namespaces/{namespace}"
        f"/repositories/{repository}/tags?page_size=100"
    )

    tags = []

    while url:
        page = request_json(url, token=token)
        tags.extend(page.get("results", []))
        url = page.get("next")

    # Keep the two most recently updated tags.
    tags.sort(
        key=lambda item: item.get("last_updated") or "",
        reverse=True,
    )

    keep = tags[:2]
    retained[repository] = [item["name"] for item in keep]

    print(f"Keeping {retained[repository]}")

    for old_tag in tags[2:]:
        name = old_tag.get("name", "")
        if not name:
            continue

        encoded_name = urllib.parse.quote(name, safe="")
        delete_url = (
            f"https://hub.docker.com/v2/namespaces/{namespace}"
            f"/repositories/{repository}/tags/{encoded_name}"
        )

        print(f"Deleting old Docker Hub tag: {repository}:{name}")

        req = urllib.request.Request(
            delete_url,
            headers={"Authorization": f"Bearer {token}"},
            method="DELETE",
        )

        with urllib.request.urlopen(req, timeout=30):
            pass

with open("retained-tags.json", "w") as output:
    json.dump(retained, output)

print("Docker Hub retention completed.")
PY
                    '''
                }
            }
        }

        stage('Local Docker Image Cleanup') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                sh '''
                    set -eu

                    python3 - <<'PY'
import json
import subprocess

with open("retained-tags.json") as file:
    retained = json.load(file)

images = subprocess.check_output(
    ["docker", "image", "ls", "--format", "{{.Repository}}:{{.Tag}}"],
    text=True,
).splitlines()

for repository, keep_tags in retained.items():
    image_prefix = f"devaraj74/{repository}:"

    for image in images:
        if not image.startswith(image_prefix):
            continue

        tag = image[len(image_prefix):]

        if tag in keep_tags or tag == "<none>":
            continue

        print(f"Removing old local image tag: {image}")

        result = subprocess.run(
            ["docker", "image", "rm", image],
            text=True,
            capture_output=True,
        )

        if result.returncode == 0:
            print(f"Removed: {image}")
        else:
            print(f"Could not remove {image}: {result.stderr.strip()}")
            print("It may still be in use; leaving it untouched.")

print("Local Docker image cleanup completed.")
PY
                '''
            }
        }
    }

    post {
        always {
            echo 'PulseTask CI pipeline finished.'
        }

        success {
            script {
                if (env.SKIP_PIPELINE == 'true') {
                    echo 'Manifest-only commit skipped successfully.'
                } else {
                    echo "Frontend image: ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${env.IMAGE_TAG}"
                    echo "Backend image: ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${env.IMAGE_TAG}"
                    echo 'Manifests updated; retention stages completed.'
                }
            }
        }
    }
}
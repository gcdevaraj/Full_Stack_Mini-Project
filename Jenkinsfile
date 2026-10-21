
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
                        error "Invalid Git commit SHA: ${commitSha}"
                    }

                    env.IMAGE_TAG = "b${env.BUILD_NUMBER}-${commitSha.take(7)}"
                    env.SKIP_PIPELINE = commitMessage.contains('[skip ci]') ? 'true' : 'false'

                    echo "Image tag: ${env.IMAGE_TAG}"
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
                    def commitSha = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    def tag = "b${env.BUILD_NUMBER}-${commitSha}"
                    env.IMAGE_TAG = tag

                    echo "Building images with tag: ${tag}"

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
                    def commitSha = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    def tag = "b${env.BUILD_NUMBER}-${commitSha}"
                    env.IMAGE_TAG = tag

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

                    echo "Successfully pushed tag: ${tag}"
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                script {
                    def commitSha = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    def tag = "b${env.BUILD_NUMBER}-${commitSha}"
                    env.IMAGE_TAG = tag

                    withCredentials([
                        usernamePassword(
                            credentialsId: 'github-write-creds',
                            usernameVariable: 'GH_USER',
                            passwordVariable: 'GH_TOKEN'
                        )
                    ]) {
                        sh """
                            set -eu
                            set +x

                            sed -i 's|image: devaraj74/pulsetask-frontend:.*|image: devaraj74/pulsetask-frontend:${tag}|' kubernetes/base/frontend.yaml

                            sed -i 's|image: devaraj74/pulsetask-backend:.*|image: devaraj74/pulsetask-backend:${tag}|' kubernetes/base/backend.yaml

                            grep -F 'image: devaraj74/pulsetask-frontend:${tag}' kubernetes/base/frontend.yaml
                            grep -F 'image: devaraj74/pulsetask-backend:${tag}' kubernetes/base/backend.yaml

                            git config user.name "Jenkins CI"
                            git config user.email "jenkins@users.noreply.github.com"

                            git add kubernetes/base/frontend.yaml kubernetes/base/backend.yaml

                            if git diff --cached --quiet; then
                                echo "Manifests already use ${tag}"
                            else
                                git commit -m "Update PulseTask images to ${tag} [skip ci]"

                                AUTH_TOKEN=\$(printf '%s:%s' "\$GH_USER" "\$GH_TOKEN" | base64 | tr -d '\\n')

                                git -c http.extraheader="AUTHORIZATION: basic \$AUTH_TOKEN" push origin HEAD:main
                            fi
                        """
                    }
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
import urllib.parse
import urllib.request

namespace = "devaraj74"
repositories = ["pulsetask-frontend", "pulsetask-backend"]

def request_json(url, method="GET", payload=None, token=None):
    data = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"

    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        url, data=data, headers=headers, method=method
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read()
        return json.loads(body) if body else {}

def manifest_tag(filename):
    with open(filename, encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if line.startswith("image:"):
                image = line.split(":", 1)[1].strip()
                return image.rsplit(":", 1)[-1]
    raise RuntimeError(f"No image tag found in {filename}")

# Protect the tags currently referenced by the GitOps manifests.
protected = {
    "pulsetask-frontend": manifest_tag("kubernetes/base/frontend.yaml"),
    "pulsetask-backend": manifest_tag("kubernetes/base/backend.yaml"),
}

auth = request_json(
    "https://hub.docker.com/v2/auth/token",
    method="POST",
    payload={
        "identifier": os.environ["RETENTION_USER"],
        "secret": os.environ["RETENTION_TOKEN"],
    },
)

token = auth.get("access_token")
if not token:
    raise RuntimeError("Docker Hub authentication returned no access token.")

retained = {}

for repository in repositories:
    print(f"Checking {repository}")

    url = (
        f"https://hub.docker.com/v2/namespaces/{namespace}"
        f"/repositories/{repository}/tags?page_size=100"
    )

    tags = []

    while url:
        page = request_json(url, token=token)
        tags.extend(page.get("results", []))
        url = page.get("next")

    tags.sort(
        key=lambda item: item.get("last_updated") or "",
        reverse=True,
    )

    # Retain the two newest tags and the manifest's currently referenced tag.
    keep = {item["name"] for item in tags[:2]}
    keep.add(protected[repository])

    available = {item["name"] for item in tags}
    missing = keep - available
    if missing:
        print(f"Protected tag(s) not found in registry: {sorted(missing)}")

    retained[repository] = sorted(keep & available)

    print(f"Keeping {repository}: {retained[repository]}")

    for item in tags:
        name = item.get("name", "")

        if not name or name in keep:
            continue

        encoded_name = urllib.parse.quote(name, safe="")
        delete_url = (
            f"https://hub.docker.com/v2/namespaces/{namespace}"
            f"/repositories/{repository}/tags/{encoded_name}"
        )

        print(f"Deleting old tag: {repository}:{name}")

        request = urllib.request.Request(
            delete_url,
            headers={"Authorization": f"Bearer {token}"},
            method="DELETE",
        )

        with urllib.request.urlopen(request, timeout=30):
            pass

with open("retained-tags.json", "w", encoding="utf-8") as output:
    json.dump(retained, output)

print("Docker Hub image retention completed.")
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

with open("retained-tags.json", encoding="utf-8") as file:
    retained = json.load(file)

images = subprocess.check_output(
    ["docker", "image", "ls", "--format", "{{.Repository}}:{{.Tag}}"],
    text=True,
).splitlines()

for repository, keep_tags in retained.items():
    prefix = f"devaraj74/{repository}:"

    for image in images:
        if not image.startswith(prefix):
            continue

        tag = image[len(prefix):]

        if tag in keep_tags or tag == "<none>":
            continue

        result = subprocess.run(
            ["docker", "image", "rm", image],
            text=True,
            capture_output=True,
        )

        if result.returncode == 0:
            print(f"Removed local image tag: {image}")
        else:
            print(f"Keeping {image}: {result.stderr.strip()}")

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
                    echo 'Manifest update and retention stages completed.'
                }
            }
        }
    }
}

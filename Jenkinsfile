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

                if (!env.BUILD_NUMBER || !(env.BUILD_NUMBER ==~ /[1-9][0-9]*/)) {
                    error "Invalid Jenkins build number: '${env.BUILD_NUMBER}'"
                }

                env.IMAGE_TAG = env.BUILD_NUMBER
                env.SKIP_PIPELINE =
                    commitMessage.contains('[skip ci]') ? 'true' : 'false'

                echo "Commit message: ${commitMessage}"
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

                if (!tag || !(tag ==~ /[1-9][0-9]*/)) {
                    error "Invalid Jenkins build number for image tag: '${tag}'"
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

                if (!tag || !(tag ==~ /[1-9][0-9]*/)) {
                    error "Invalid Jenkins build number for image tag: '${tag}'"
                }

                echo "Pushing images with tag: ${tag}"

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

                        printf '%s' "\$DH_TOKEN" | docker login -u "\$DH_USER" --password-stdin

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
            script {
                def tag = env.IMAGE_TAG

                if (!tag || !(tag ==~ /[1-9][0-9]*/)) {
                    error "Invalid Jenkins build number for image tag: '${tag}'"
                }

                echo "Updating manifests to tag: ${tag}"

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
                            echo "Manifests already use tag ${tag}"
                            exit 0
                        fi

                        git commit -m "Update PulseTask images to ${tag} [skip ci]"

                        AUTH_TOKEN=\$(printf '%s:%s' "\$GH_USER" "\$GH_TOKEN" | base64 | tr -d '\\n')

                        git -c http.extraheader="AUTHORIZATION: basic \$AUTH_TOKEN" push origin HEAD:main
                    """
                }
            }
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
                echo 'Kubernetes manifests updated. Argo CD reconciliation may still be in progress.'
            }
        }
    }
}

}
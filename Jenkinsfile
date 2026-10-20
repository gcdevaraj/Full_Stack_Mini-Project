
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
                checkout scm
                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    def commitMessage = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    if (commitMessage.contains('[skip ci]')) {
                        env.SKIP_PIPELINE = 'true'
                        echo 'Jenkins manifest commit detected. Skipping build stages.'
                    }
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
                sh '''
                    docker build -t ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                    docker build -t ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                '''
            }
        }

        stage('Push Docker Images') {
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
                        set +x
                        echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                        docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker logout
                    '''
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

                        sed -i -E \
                          "s|(image: devaraj74/pulsetask-frontend:).*|\\1${IMAGE_TAG}|" \
                          kubernetes/base/frontend.yaml

                        sed -i -E \
                          "s|(image: devaraj74/pulsetask-backend:).*|\\1${IMAGE_TAG}|" \
                          kubernetes/base/backend.yaml

                        git config user.name "PulseTask Jenkins"
                        git config user.email "jenkins@users.noreply.github.com"

                        git add kubernetes/base/frontend.yaml kubernetes/base/backend.yaml

                        if git diff --cached --quiet; then
                            echo "Image tags are already up to date."
                        else
                            git commit -m "Update PulseTask images to ${IMAGE_TAG} [skip ci]"

                            AUTH=$(printf '%s' "$GH_USER:$GH_TOKEN" | base64 | tr -d '\\n')

                            git -c http.extraheader="AUTHORIZATION: basic $AUTH" \
                                push origin HEAD:main

                            unset AUTH
                        fi
                    '''
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
                    echo "Images published and Kubernetes manifests updated to ${env.IMAGE_TAG}"
                }
            }
        }
    }
}

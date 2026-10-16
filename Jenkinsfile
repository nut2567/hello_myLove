// Requires the Docker Pipeline plugin and Docker CLI inside Jenkins,
// with access to a Docker daemon and a Unix shell on the Jenkins agent.
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                // Declarative Pipeline automatically checks out the configured SCM.
                echo 'Code was checked out.'
                sh 'ls -la'
            }
        }

        stage('Install') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            // Inherits the pipeline's agent any.
            steps {
                sh 'docker build -t hello-my-love:${BUILD_NUMBER} .'
            }
        }

        stage('Done') {
            steps {
                echo "Built image: hello-my-love:${env.BUILD_NUMBER}"
            }
        }
    }

    post {
        always {
            echo "Build result: ${currentBuild.currentResult}"
        }
    }
}

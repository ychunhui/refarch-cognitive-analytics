pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd src;npm install'
                sh 'cd ..;build.sh'
            }
        }
    }
}

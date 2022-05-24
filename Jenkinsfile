pipeline {
  agent { 
    label "linux" 
  }
  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
    disableConcurrentBuilds()
  }
  stages {
    stage('Hello') {
      steps {
        echo 'Hello'
      }
    }
    stage('build-frontend') {
      agent {
        dockerfile {
          filename 'Dockerfile'
          dir 'client'
          additionalBuildArgs '--build-arg UID=113 --build-arg serverurl=https://mochatto.com:4000'
        }
      }
      steps {
        echo "Build Frontend"
      }
    }
    stage('build-backend') {
      agent {
        dockerfile {
          filename 'Dockerfile'
          dir 'server'
        }
      }
      steps {
        echo "Build Backend"
      }
    }
    stage('test-frontend') {
      steps {
        sh '''
          make beta-up
        '''
      }
    }
    stage('test-backend') {
      steps {
        sh '''
          echo "Test Backend"
          make dev-up
        '''
      }
    }
    stage('dev-deploy') {
      when {
        branch "dev"
      }
      steps {
        sh '''
          echo "Deploy Main"
        '''
      }
    }
    stage('main-deploy') {
      when {
        branch "main"
      }
      steps {
        sh '''
          make prod-up
        '''
      }
    }
  }
}

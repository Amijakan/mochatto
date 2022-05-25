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
    stage('test-frontend') {
      steps {
        sh '''
          echo "Test Frontend"
        '''
      }
    }
    stage('test-backend') {
      steps {
        sh '''
          echo "Test Backend"
        '''
      }
    }
    stage('dev-deploy') {
      when {
        branch "setup-jenkins"
      }
      steps {
        sh '''
          echo "Deploy Dev"
          make beta-up
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

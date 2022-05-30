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
    stage('dev-deploy') {
      when {
        branch "ft-* rf-* bg-*"
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

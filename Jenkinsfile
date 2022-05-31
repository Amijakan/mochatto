pipeline {
  agent { 
    label "linux" 
  }
  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
    disableConcurrentBuilds()
  }
  stages {
    stage('dev-deploy') {
      steps {
        sh '''
          echo "Deploy Dev"
          make beta-up
        '''
        script {
          pullRequest.comment("Deployed to https://${BRANCH_NAME.toLowerCase()}.dev.mochatto.com")
        }
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

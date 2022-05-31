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
          for (comment in pullRequest.comments) {
              if (comment.body.startsWith("AUTOMATED: ")) {
                  pullRequest.deleteComment(comment.id)
              }
          }
          pullRequest.comment("AUTOMATED: Deployed to https://${BRANCH_NAME.toLowerCase()}.dev.mochatto.com")
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

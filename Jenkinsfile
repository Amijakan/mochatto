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
        echo $GIT_BRANCH
      }
    }
    stage('dev-deploy') {
      when {
        expression { GIT_BRANCH ==~ /(ft|bg|rf)-*/ };
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
        expression { GIT_BRANCH == "main" };
      }
      steps {
        sh '''
          make prod-up
        '''
      }
    }
  }
}

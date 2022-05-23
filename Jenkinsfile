pipeline {
  agent { label "linux" }
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
    stage('test') {
      steps {
        sh '''
          echo "Test"
          ls
        '''
      }
    }
    stage('build') {
      steps {
        sh '''
          echo "Build"
          echo $PWD
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
          echo "Deploy Main"
        '''
      }
    }
  }
}

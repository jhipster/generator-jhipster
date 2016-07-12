#!/bin/bash
set -ev
#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
cd "$HOME"/app
if [ "$JHIPSTER" == "app-default-from-scratch" ]; then
  if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    ./mvnw clean org.jacoco:jacoco-maven-plugin:prepare-agent package sonar:sonar -Dsonar.host.url=https://sonarqube.com -Dsonar.login=$SONAR_TOKEN
  fi
fi

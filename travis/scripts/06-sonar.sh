#!/bin/bash
set -ev
#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
cd "$HOME"/app
if [ "$JHIPSTER" == "app-default-from-scratch" ]; then
  ./mvnw clean org.jacoco:jacoco-maven-plugin:prepare-agent package sonar:sonar -Dsonar.host.url=https://nemo.sonarqube.org -Dsonar.login=$SONAR_TOKEN
fi

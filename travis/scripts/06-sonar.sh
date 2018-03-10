#!/bin/bash

#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
cd "$APP_FOLDER"
if [ "$JHIPSTER" == "ngx-default" ]; then
    if [ "$TRAVIS_REPO_SLUG" = "jhipster/generator-jhipster" ] && [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
        ./mvnw org.jacoco:jacoco-maven-plugin:prepare-agent sonar:sonar -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=$SONAR_TOKEN
    fi
fi

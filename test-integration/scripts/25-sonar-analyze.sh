#!/bin/bash

source $(dirname $0)/00-init-env.sh

#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ "$JHI_APP" == "ngx-default" ]; then
    # specitic to Travis here
    if [ "$TRAVIS_REPO_SLUG" = "jhipster/generator-jhipster" ] && [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
        ./mvnw org.jacoco:jacoco-maven-plugin:prepare-agent sonar:sonar -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=$SONAR_TOKEN
    fi
fi

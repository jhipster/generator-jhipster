#!/bin/bash

source $(dirname $0)/00-init-env.sh

#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ "$JHI_APP" == "ngx-default" ]; then
    # specitic to Travis here
    if [ "$TRAVIS_REPO_SLUG" = "jhipster/generator-jhipster" ]; then
        if [ "$TRAVIS_BRANCH" = "master" ]; then
            echo "*** Sonar analyze for master branch"
            ./mvnw org.jacoco:jacoco-maven-plugin:prepare-agent sonar:sonar \
                -Dsonar.host.url=https://sonarcloud.io \
                -Dsonar.login=$SONAR_TOKEN
        else
            echo "*** Sonar analyze for $TRAVIS_PULL_REQUEST"
            ./mvnw org.jacoco:jacoco-maven-plugin:prepare-agent sonar:sonar \
                -Dsonar.host.url=https://sonarcloud.io \
                -Dsonar.login=$SONAR_TOKEN \
                -Dsonar.pullrequest.provider=github \
                -Dsonar.pullrequest.github.repository=$TRAVIS_REPO_SLUG
                -Dsonar.pullrequest.base=master \
                -Dsonar.pullrequest.key=$TRAVIS_PULL_REQUEST \
                -Dsonar.pullrequest.branch=$TRAVIS_PULL_REQUEST_BRANCH \
        fi
    fi
fi

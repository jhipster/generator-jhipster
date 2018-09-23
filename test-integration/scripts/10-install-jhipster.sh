#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
cd "$HOME"
if [[ "$JH_REPO" == *"/jhipster" ]]; then
    echo "No need to clone jhipster: use local version at JH_REPO=$JH_REPO"

    cd "$JH_HOME"
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    ./mvnw clean install -Dgpg.skip=true

elif [[ "$JH_LIB_BRANCH" == "release" ]]; then
    echo "No need to clone jhipster: use release version"

else
    git clone "$JH_LIB_REPO" jhipster
    cd jhipster
    if [ "$JH_LIB_BRANCH" == "latest" ]; then
        LATEST=$(git describe --abbrev=0)
        git checkout "$LATEST"
    elif [ "$JH_LIB_BRANCH" != "master" ]; then
        git checkout "$JH_LIB_BRANCH"
    fi
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    "$JH_SCRIPTS"/13-replace-version-generated-project.sh

    ./mvnw clean install -Dgpg.skip=true
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-framework/
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-dependencies/
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-parent/
fi

#-------------------------------------------------------------------------------
# Install JHipster Generator
#-------------------------------------------------------------------------------
cd "$HOME"
if [[ "$JH_REPO" == *"/generator-jhipster" ]]; then
    echo "No need to clone generator-jhipster: use local version at JH_REPO=$JH_REPO"

    cd "$JH_HOME"
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    npm install
    npm install -g "$JH_HOME"
    if [[ "$JH_APP" == "" || "$JH_APP" == "ngx-default" ]]; then
        npm test
    fi

elif [[ "$JH_GEN_BRANCH" == "release" ]]; then
    echo "No need to clone generator-jhipster: use release version"
    npm install -g generator-jhipster

else
    echo "Use generator-jhipster: JH_GEN_REPO=$JH_GEN_REPO with JH_GEN_BRANCH=$JH_GEN_BRANCH"
    git clone "$JH_GEN_REPO" generator-jhipster
    cd generator-jhipster
    if [ "$JH_GEN_BRANCH" == "latest" ]; then
        LATEST=$(git describe --abbrev=0)
        git checkout "$LATEST"
    elif [ "$JH_GEN_BRANCH" != "master" ]; then
        git checkout "$JH_GEN_BRANCH"
    fi
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    npm install
    npm install -g "$HOME"/generator-jhipster
fi

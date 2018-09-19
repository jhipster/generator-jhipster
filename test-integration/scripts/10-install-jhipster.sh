#!/bin/bash
set -e

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
cd "$HOME"
if [[ "$JH_REPO" == *"/jhipster" ]]; then
    echo "JH_REPO=$JH_REPO"
    echo "No need to clone jhipster: use local version"
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    cd "$JH_HOME"
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
    echo "JH_REPO=$JH_REPO"
    echo "No need to clone generator-jhipster: use local version"
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    cd "$JH_HOME"
    ls -al
    npm install
    npm install -g "$JH_HOME"
    if [[ "$JH_APP" == "" || "$JH_APP" == "ngx-default" ]]; then
        npm test
    fi

elif [[ "$JH_GEN_BRANCH" == "release" ]]; then
    npm install -g generator-jhipster

else
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

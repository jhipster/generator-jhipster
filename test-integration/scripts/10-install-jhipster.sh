#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
cd "$HOME"

if [[ ("$JHI_REPO" == *"/jhipster-bom" && "$JHI_LIB_BRANCH" == "auto") || "$JHI_LIB_BRANCH" == "local" ]]; then
    echo "*** jhipster: use local version at JHI_LIB_HOME=$JHI_LIB_HOME"

    cd "$JHI_LIB_HOME"
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    test-integration/scripts/10-replace-version-jhipster.sh

    ./mvnw -ntp clean install -Dgpg.skip=true --batch-mode
    ls -al ~/.m2/repository/tech/jhipster/jhipster-framework/
    ls -al ~/.m2/repository/tech/jhipster/jhipster-dependencies/
    ls -al ~/.m2/repository/tech/jhipster/jhipster-parent/

elif [[ "$JHI_LIB_BRANCH" == "release" || "$JHI_LIB_BRANCH" == "ignore" ]]; then
    echo "*** jhipster: use release version"

else
    if [ "$JHI_LIB_BRANCH" == "latest" ]; then
        JHI_LIB_BRANCH=$(git describe --abbrev=0)
    elif [ "$JHI_LIB_BRANCH" == "auto" ]; then
        JHI_LIB_BRANCH=main
    fi
    echo "*** jhipster: JHI_LIB_REPO=$JHI_LIB_REPO with JHI_LIB_BRANCH=$JHI_LIB_BRANCH"

    git clone -b "$JHI_LIB_BRANCH" --depth 5 "$JHI_LIB_REPO" $JHI_LIB_HOME
    cd $JHI_LIB_HOME
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    test-integration/scripts/10-replace-version-jhipster.sh

    ./mvnw -ntp clean install -DskipTests  -Dmaven.javadoc.skip=true -Dgpg.skip=true --batch-mode
    ls -al ~/.m2/repository/tech/jhipster/jhipster-framework/
    ls -al ~/.m2/repository/tech/jhipster/jhipster-dependencies/
    ls -al ~/.m2/repository/tech/jhipster/jhipster-parent/
fi

#-------------------------------------------------------------------------------
# Install JHipster Generator
#-------------------------------------------------------------------------------
cd "$HOME"
if [[ "$JHI_GEN_BRANCH" == "release" ]]; then
    echo "*** generator-jhipster: use release version"
    npm install -g generator-jhipster

else
    if [[ "$JHI_REPO" == *"/generator-jhipster" || "$JHI_GEN_BRANCH" == "local" ]]; then
        echo "*** generator-jhipster or executable: use local version at JHI_CLI_PACKAGE_PATH=$JHI_CLI_PACKAGE_PATH"
        cd "$JHI_CLI_PACKAGE_PATH"
    else
        if [ "$JHI_GEN_BRANCH" == "latest" ]; then
            JHI_GEN_BRANCH=$(git describe --abbrev=0)
        fi
        echo "*** generator-jhipster: JHI_GEN_REPO=$JHI_GEN_REPO with JHI_GEN_BRANCH=$JHI_GEN_BRANCH"
        git clone -b "$JHI_GEN_BRANCH" --depth 5 "$JHI_GEN_REPO" generator-jhipster
        cd generator-jhipster
    fi

    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    npm ci --ignore-scripts

    if [[ "$JHI_INSTALL_GLOBALLY" == "true" || "$JHI_BIN_FOLDER" == "" ]]; then
        echo "*** installing generator-jhipster globally"
        npm install -g .
    else
        echo "*** adding development jhipster to path"
        ln -s "$(pwd)/bin/jhipster.mjs" "$JHI_BIN_FOLDER/jhipster"
        ls -la bin "$JHI_BIN_FOLDER"
        jhipster --install-path
    fi
fi

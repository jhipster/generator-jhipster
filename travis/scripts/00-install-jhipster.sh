#!/usr/bin/env bash

#  Copyright 2013-2018 the original author or authors from the JHipster project.
#
# This file is part of the JHipster project, see https://www.jhipster.tech/
# for more information.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -exu
function echoSetX() {
    echo -e "\\n----------------------------------------------------------\\n" \
        "\\n$1\\n" \
        "\\n--------------------------------------------------------------\\n"
}

#-------------------------------------------------------------------------------
# List HOME
#-------------------------------------------------------------------------------
set +x
echoSetX "List HOME"
set -x

ls -al "$HOME"

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
set +x
echoSetX "Install JHipster Dependencies and Server-side library"
set -x

cd "$HOME"
if [[ "$TRAVIS_REPO_SLUG" == *"/jhipster" ]]; then
    echo "TRAVIS_REPO_SLUG=$TRAVIS_REPO_SLUG"
    echo "No need to clone jhipster: use local version"

    cd "$TRAVIS_BUILD_DIR"
    ./mvnw clean install -Dgpg.skip=true

elif [[ "$JHIPSTER_LIB_BRANCH" == "release" ]]; then
    echo "No need to clone jhipster: use release version"

else
    git clone "$JHIPSTER_LIB_REPO" jhipster
    cd jhipster
    if [ "$JHIPSTER_LIB_BRANCH" == "latest" ]; then
        LATEST=$(git describe --abbrev=0)
        git checkout -b "$LATEST" "$LATEST"
    elif [ "$JHIPSTER_LIB_BRANCH" != "master" ]; then
        git checkout -b "$JHIPSTER_LIB_BRANCH" origin/"$JHIPSTER_LIB_BRANCH"
    fi
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    travis/scripts/00-replace-version-jhipster.sh

    ./mvnw clean install -Dgpg.skip=true
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-framework/
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-dependencies/
    ls -al ~/.m2/repository/io/github/jhipster/jhipster-parent/
fi

#-------------------------------------------------------------------------------
# Install and test JHipster Generator
#-------------------------------------------------------------------------------
set +x
echoSetX "Install and test (not at each Travis Build) JHipster Generator"
set -x

cd "$HOME"

if [[ "$TRAVIS_REPO_SLUG" == *"/generator-jhipster" ]]; then
    echo "TRAVIS_REPO_SLUG=$TRAVIS_REPO_SLUG"
    echo "No need to clone generator-jhipster: use local version"

    cd "$TRAVIS_BUILD_DIR"/
    yarn install
    yarn global add file:"$TRAVIS_BUILD_DIR"
    if [[ "$JHIPSTER" == "" || "$JHIPSTER" == "ngx-default" ]]; then
        # If this change, please update also ../build-samples.sh, function generateProject().
        yarn test
    fi

elif [[ "$JHIPSTER_BRANCH" == "release" ]]; then
    yarn global add generator-jhipster

else
    git clone "$JHIPSTER_REPO" generator-jhipster
    cd generator-jhipster
    if [ "$JHIPSTER_BRANCH" == "latest" ]; then
        LATEST=$(git describe --abbrev=0)
        git checkout -b "$LATEST" "$LATEST"
    elif [ "$JHIPSTER_BRANCH" != "master" ]; then
        git checkout -b "$JHIPSTER_BRANCH" origin/"$JHIPSTER_BRANCH"
    fi
    git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    yarn install
    yarn global add file:"$HOME"/generator-jhipster
fi

#-------------------------------------------------------------------------------
# List HOME
#-------------------------------------------------------------------------------
set +x
echoSetX "List HOME"
set -x

ls -al "$HOME"

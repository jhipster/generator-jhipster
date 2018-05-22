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

function generateProject() {
    if [[ "$IS_TRAVIS_CI" -eq 0 ]] \
        && [[ "$IS_SKIP_CLIENT" -eq 0 ]] ; then
        # If it's ../build-samples.sh and not Travis CI if if there is a client
        if [[ "$JHIPSTER" != *"react"* ]] ; then
            jhipster --force --no-insight --skip-checks --with-entities --skip-git --skip-commit-hook --skip-install
        else
            echo "Not already implemented for react for react. Skip tests on" \
            "react projects"
            exit 100
        fi
    else
        jhipster --force --no-insight --skip-checks --with-entities --skip-git --skip-commit-hook
    fi
    ls -la
}

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
set +x
echoSetX "Force no insight"
set -x

if [[ "$APP_FOLDER" == "$HOME/app" ]]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHIPSTER_TRAVIS"/configstore/*.json "$HOME"/.config/configstore/
fi

#-------------------------------------------------------------------------------
# Generate the project with jhipster
#-------------------------------------------------------------------------------
set +x
echoSetX "Generate the project with jhipster"
set -x

if [[ "$JHIPSTER" == *"uaa"* ]]; then
    mkdir -p "$UAA_APP_FOLDER"
    cp -f "$JHIPSTER_SAMPLES"/uaa/.yo-rc.json "$UAA_APP_FOLDER"/
    cd "$UAA_APP_FOLDER"
    generateProject
fi

mkdir -p "$APP_FOLDER"
cp -f "$JHIPSTER_SAMPLES"/"$JHIPSTER"/.yo-rc.json "$APP_FOLDER"/
cd "$APP_FOLDER"
generateProject


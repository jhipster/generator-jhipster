#!/usr/bin/env bash
# -*- coding: UTF8 -*-

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

#--------------------------------------------------
# Launch Sonar analysis
#--------------------------------------------------
set +x
echoSetX "Launch Sonar analysis"
set -x

cd "$APP_FOLDER"
if [[ "$JHIPSTER" == "ngx-default" ]]; then
    if [[ "$TRAVIS_REPO_SLUG" = "jhipster/generator-jhipster" ]] \
        && [[ "$TRAVIS_BRANCH" = "master" ]] \
        && [[ "$TRAVIS_PULL_REQUEST" = "false" ]]; then
        ./mvnw org.jacoco:jacoco-maven-plugin:prepare-agent \
            sonar:sonar \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.login="$SONAR_TOKEN"
    fi
fi

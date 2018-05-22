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

if [[ "$JHIPSTER_LIB_BRANCH" == "release" ]]; then
    echo "No need to change version in generated project"
    exit 0
fi

if [[ $JHIPSTER_VERSION == '' ]]; then
    JHIPSTER_VERSION=0.0.0-TRAVIS
fi

# jhipster-dependencies.version in generated pom.xml or gradle.properties
cd "$APP_FOLDER"
if [[ -a mvnw ]]; then
    sed -e 's/<jhipster-dependencies.version>.*<\/jhipster-dependencies.version>/<jhipster-dependencies.version>'$JHIPSTER_VERSION'<\/jhipster-dependencies.version>/1;' pom.xml > pom.xml.sed
    mv -f pom.xml.sed pom.xml
    grep \<jhipster-dependencies.version\> < pom.xml

elif [[ -a gradlew ]]; then
    sed -e 's/jhipster_dependencies_version=.*/jhipster_dependencies_version='$JHIPSTER_VERSION'/1;' gradle.properties > gradle.properties.sed
    mv -f gradle.properties.sed gradle.properties
    grep jhipster_dependencies_version= < gradle.properties

fi

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
# Display environment information like JDK version
#-------------------------------------------------------------------------------
set +x
echoSetX "Display environment information like JDK version"
set -x


cd "$APP_FOLDER"
if [ -f "mvnw" ]; then
    ./mvnw enforcer:display-info
elif [ -f "gradlew" ]; then
    ./gradlew -v
fi

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
set +x
echoSetX "Check Javadoc generation"
set -x

if [ -f "mvnw" ]; then
    ./mvnw javadoc:javadoc
elif [ -f "gradlew" ]; then
    ./gradlew javadoc
fi

#-------------------------------------------------------------------------------
# Launch UAA tests
#-------------------------------------------------------------------------------
set +x
echoSetX "Launch UAA tests"
set -x

if [[ "$JHIPSTER" == *"uaa"* ]]; then
    cd "$UAA_APP_FOLDER"
    ./mvnw test
fi

#-------------------------------------------------------------------------------
# Launch tests
#-------------------------------------------------------------------------------
set +x
echoSetX "Launch tests"
set -x

cd "$APP_FOLDER"
if [ -f "mvnw" ]; then
    ./mvnw test \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.io.github.jhipster=OFF \
        -Dlogging.level.io.github.jhipster.sample=OFF \
        -Dlogging.level.io.github.jhipster.travis=OFF
elif [ -f "gradlew" ]; then
    ./gradlew test \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.io.github.jhipster=OFF \
        -Dlogging.level.io.github.jhipster.sample=OFF \
        -Dlogging.level.io.github.jhipster.travis=OFF
fi
if [ -f "tsconfig.json" ]; then
    yarn test
fi

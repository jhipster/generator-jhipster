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

set -ex
function echoSetX() {
    echo -e "\n-------------------------------------------------------------------------------\n" \
        "\n$1\n" \
        "\n-------------------------------------------------------------------------------\n"
}

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------

launchCurlOrProtractor() {
    local -i retryCount=1
    local -ir maxRetry=10
    declare -gir serverPort=`grep --color=never -E \
        '"serverPort"\s*:\s*"[0-9]+"' .yo-rc.json \
        | grep --color=never -Eo '[0-9]+' \
        || echo 8080
        `
    local -r httpUrl="http://localhost:""${serverPort}"
    if [[ "$JHIPSTER" == *"micro"* ]]; then
        local -r httpUrl="http://localhost:""${serverPort}""/management/health"
    fi

    # --fail: fail due to the  server's  HTTP  status code
    # return error 22.
    # When server send staus code 200, 401 or 407, $rep takes value 0.
    # But when it sends status code like 500, 404, etc, $rep takes value 22.
    set -x
    while ! curl -v --fail "$httpUrl" && [[ "$retryCount" -le "$maxRetry" ]]; do
        echo "[$(date)] Application not reachable yet. Sleep and retry - retryCount =" $retryCount "/" $maxRetry
        retryCount=$((retryCount+1))
        sleep 10
    done
    set +x

    if [[ "$retryCount" -gt "$maxRetry" ]]; then
        echo "[$(date)] Not connected after" $retryCount " retries."
        return 1
    fi
    if [ "$PROTRACTOR" != 1 ]; then
        return 0
    fi

    local -i result=0
    if [[ -f "tsconfig.json" ]]; then
        set +e
        yarn e2e
        result=$?
        set -e
        if [[ "$result" -ne 0 ]] ; then
            echo "e2e tests failed."
        fi
    fi
    return $result
}

if [[ "$IS_TRAVIS_CI" -eq 1 ]]  || \
    [[ "$IS_STARTAPPLICATION" -eq 0 ]]; then
    # If we are in Travis CI or in `../build-samples.sh generate'
    # or `../build-samples.sh generateandtest'

    #--------------------------------------------------------------------------
    # Package UAA
    #--------------------------------------------------------------------------
    set +x
    echoSetX "Package UAA"
    set -x

    if [[ "$JHIPSTER" == *"uaa"* ]]; then
        cd "$UAA_APP_FOLDER"
        ./mvnw verify -DskipTests -P "$PROFILE"
    fi

    #--------------------------------------------------------------------------
    # Package the application
    #--------------------------------------------------------------------------

    set +x
    echoSetX "Package the application"
    set -x

    cd "$APP_FOLDER"

    if [ -f "mvnw" ]; then
        ./mvnw verify -DskipTests -P "$PROFILE"
        mv target/*.war app.war
    elif [ -f "gradlew" ]; then
        ./gradlew bootWar -P "$PROFILE" -x test
        mv build/libs/*.war app.war
    else
        echo "No mvnw or gradlew"
        exit 0
    fi
    if [ $? -ne 0 ]; then
        echo "Error when packaging"
        exit 1
    fi

    if [[ "$IS_TRAVIS_CI" -eq 0 ]] && \
        [[ "$IS_GENERATEANDTEST" -eq 0 ]] ; then
        exit  0
    fi
fi

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------
set +x
echoSetX "Run the application"
set -x

if [ "$RUN_APP" == 1 ]; then
    if [[ "$JHIPSTER" == *"uaa"* ]]; then
        cd "$UAA_APP_FOLDER"
        java -jar target/*.war \
            --spring.profiles.active="$PROFILE" \
            --logging.level.org.zalando=OFF \
            --logging.level.io.github.jhipster=OFF \
            --logging.level.io.github.jhipster.sample=OFF \
            --logging.level.io.github.jhipster.travis=OFF &
        sleep 80
    fi

    cd "$APP_FOLDER"
    java -jar app.war \
        --spring.profiles.active="$PROFILE" \
        --logging.level.org.zalando=OFF \
        --logging.level.io.github.jhipster=OFF \
        --logging.level.io.github.jhipster.sample=OFF \
        --logging.level.io.github.jhipster.travis=OFF &
    echo $! > .pid
    sleep 40

    launchCurlOrProtractor && result=$? || result=$?
    if [[ "$IS_TRAVIS_CI" -eq 1 ]]  || \
        [[ "$IS_STARTAPPLICATION" -eq 0 ]]; then
        # If we are in Travis CI or in `../build-samples.sh generate'
        # or `../build-samples.sh generateandtest'
        kill $(cat .pid)
    else
        # If it's `../build-samples.sh startapplication sample_name'
        echo -e "\n\n\033[0;31m"\
            "Server is launched at http://localhost://""$serverPort" \
            "\033[0m \n\n"
        echo -e "\n\n\033[1;31m""WARNING: YOU MUST MANUALLY TERMINATE " \
            "THIS JAVA APPLICATION (\`kill $(cat .pid)')""\033[0m\n\n"
    fi
    wait
    exit $result
fi

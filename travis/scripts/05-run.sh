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

if [[ "$IS_TRAVIS_CI" -eq 0 ]] ; then
    # If we are not and Travis CI

    # trap of INT ../build-samples.sh
    # is raised after this trap :-). Good.
    trap "echo '\\n\`./05-run.sh' exited by user.'" INT
    trap exitJavaApp EXIT # raised even if we type <CTRL-C>
    function exitJavaApp() {
        if [[ ! -z ${JAVA_PID+x} ]] ; then
            1>&2 echo "Killing Java Application..."
            1>&2 echo "kill '$JAVA_PID'"
            kill "$JAVA_PID"
            1>&2 echo "Done..."
        fi
    }
fi

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
launchCurlOrProtractor() {

    if [ -a src/main/docker/couchbase.yml ]; then
        docker-compose -f src/main/docker/couchbase.yml up -d
        sleep 10
    fi

    local -i retryCount=1
    local -ir maxRetry=10
    declare -gi serverPort
    serverPort=$(grep --color=never -E \
        '"serverPort"\s*:\s*"[0-9]+"' .yo-rc.json \
        | grep --color=never -Eo '[0-9]+' \
        || echo 8080)
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
        if yarn e2e ; then
            result=$?
            echo "e2e tests passed."
        else
            result=$?
            echo "e2e tests failed."
        fi
    fi
    return $result
}

if [[ "$IS_TRAVIS_CI" -eq 1 ]] \
    ||([[ "$IS_STARTAPPLICATION" -eq 0 ]] \
        && [[ "$IS_SKIPPACKAGEAPP" -eq 0 ]]); then
        # 1. If we are in Travis CI
        # 2. or
            # 2.1
                # in `../build-samples.sh generate'  or
                # in `../build-samples.sh generateandtest'
            # 2.2 AND NOT In `../build-samples.sh generate --skippackageapp'

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

    if [[ -f "mvnw" ]]; then
        if ./mvnw verify -DskipTests -P "$PROFILE" ; then
            mv target/*.war app.war
            exit 0
        else
            echo "Error when packaging"
            exit 1
        fi
    elif [[ -f "gradlew" ]]; then
        if ./gradlew bootWar -P "$PROFILE" -x test ; then
            mv build/libs/*.war app.war
        else
            echo "Error when packaging"
            exit 1
        fi
    else
        echo "No mvnw or gradlew"
    fi
    exit 0
fi

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------
set +x
echoSetX "Run the application"
set -x

if [[ "$IS_TRAVIS_CI" -eq 1 ]] \
    || [[ "$IS_STARTAPPLICATION" -eq 1 ]] \
    || [[ "$IS_GENERATEANDTEST" -eq 1 ]] ; then
    # 1. If we are in Travis CI
    # 2. OR in `../build-samples.sh startapplication'
    # 2. OR in `../build-samples.sh generateandtest'

    cd "$APP_FOLDER"
    if [ -a src/main/docker/couchbase.yml ]; then
        time docker-compose -f src/main/docker/couchbase.yml couchbase build
        docker-compose -f src/main/docker/couchbase.yml up -d
        sleep 10
    fi

    if [[ "$JHIPSTER" == *"uaa"* ]]; then
        cd "$UAA_APP_FOLDER"
        java -jar target/*.war \
            --spring.profiles.active="$PROFILE" \
            --logging.level.org.zalando=OFF \
            --logging.level.io.github.jhipster=OFF \
            --logging.level.io.github.jhipster.sample=OFF \
            --logging.level.io.github.jhipster.travis=OFF &
        sleep 80
        # TODO test it
        # Test if when we type <Ctrl-C> it is gracefully stopped (probably not)
    fi

    cd "$APP_FOLDER"
    java -jar app.war \
        --spring.profiles.active="$PROFILE" \
        --logging.level.org.zalando=OFF \
        --logging.level.io.github.jhipster=OFF \
        --logging.level.io.github.jhipster.sample=OFF \
        --logging.level.io.github.jhipster.travis=OFF &
    declare -r JAVA_PID="$!"
    sleep 40

    if launchCurlOrProtractor ; then
        declare -r result=$?
    else
        declare -r result=$?
    fi

    if [[ "${IS_TRAVIS_CI}" -eq 1 ]] \
        && [[ "$IS_STARTAPPLICATION" -eq 0 ]]; then
        # If we are in Travis CI AND
        # in `../build-samples.sh generateandtest'
        # (see also surrounded if)
        kill "$JAVA_PID"
    else
        echo "ps -o pid,command"
        ps -o pid,command
        # If we are in `../build-samples.sh startapplication'.
        echo -e "\\n\\n\\033[0;31m"\
            "Server is launched at http://localhost://""$serverPort" \
            "\\033[0m \\n\\n"
        # TODO test close the term, then see if Java is running.
        echo -e "\\n\\n\\033[1;31m""Type CTRL+C ONLY ONE TIME to terminate " \
            "gracefully the app and terminate the Java App. " \
            "DO NOT TYPE SEVERAL TIMES CTRL+C. \\033[0m"
        wait
    fi

    exit $result

fi

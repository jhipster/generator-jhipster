#!/bin/bash

source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Specific for couchbase
#-------------------------------------------------------------------------------
cd "$JH_FOLDER_APP"
if [ -a src/main/docker/couchbase.yml ]; then
    docker-compose -f src/main/docker/couchbase.yml up -d
    sleep 10
fi

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
launchCurlOrProtractor() {
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8080"
    if [[ "$JH_APP" == *"micro"* ]]; then
        httpUrl="http://localhost:8081/management/health"
    fi

    rep=$(curl -v "$httpUrl")
    status=$?
    while [ "$status" -ne 0 ] && [ "$retryCount" -le "$maxRetry" ]; do
        echo "[$(date)] Application not reachable yet. Sleep and retry - retryCount =" $retryCount "/" $maxRetry
        retryCount=$((retryCount+1))
        sleep 10
        rep=$(curl -v "$httpUrl")
        status=$?
    done

    if [ "$status" -ne 0 ]; then
        echo "[$(date)] Not connected after" $retryCount " retries."
        return 1
    fi

    if [ "$JH_PROTRACTOR" != 1 ]; then
        return 0
    fi

    retryCount=0
    maxRetry=1
    until [ "$retryCount" -ge "$maxRetry" ]
    do
        result=0
        if [[ -f "tsconfig.json" ]]; then
            ls -al node_modules/webdriver-manager/selenium/
            npm run e2e
        fi
        result=$?
        [ $result -eq 0 ] && break
        retryCount=$((retryCount+1))
        echo "e2e tests failed... retryCount =" $retryCount "/" $maxRetry
        sleep 15
    done
    return $result
}

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------
if [ "$JH_RUN_APP" == 1 ]; then
    if [[ "$JH_APP" == *"uaa"* ]]; then
        cd "$JH_FOLDER_UAA"
        java -jar target/*.war \
            --spring.profiles.active="$JH_PROFILE" &
            # --spring.profiles.active="$JH_PROFILE" \
            # --logging.level.org.zalando=OFF \
            # --logging.level.io.github.jhipster=OFF \
            # --logging.level.io.github.jhipster.sample=OFF \
            # --logging.level.io.github.jhipster.travis=OFF &
        sleep 80
    fi

    cd "$JH_FOLDER_APP"
    java -jar app.war \
        --spring.profiles.active="$JH_PROFILE" &
        # --spring.profiles.active="$JH_PROFILE" \
        # --logging.level.org.zalando=OFF \
        # --logging.level.io.github.jhipster=OFF \
        # --logging.level.io.github.jhipster.sample=OFF \
        # --logging.level.io.github.jhipster.travis=OFF &
    echo $! > .pid
    sleep 40

    launchCurlOrProtractor
    result=$?
    kill $(cat .pid)
    exit $result
fi

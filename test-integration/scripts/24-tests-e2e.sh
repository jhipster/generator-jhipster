#!/bin/bash

source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Specific for couchbase
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -a src/main/docker/couchbase.yml ]; then
    docker-compose -f src/main/docker/couchbase.yml up -d
    sleep 20
    docker ps -a
fi

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
launchCurlOrProtractor() {
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8080"
    if [[ "$JHI_APP" == *"micro"* ]]; then
        httpUrl="http://localhost:8081/management/health"
    fi

    rep=$(curl -v "$httpUrl")
    status=$?
    while [ "$status" -ne 0 ] && [ "$retryCount" -le "$maxRetry" ]; do
        echo "*** [$(date)] Application not reachable yet. Sleep and retry - retryCount =" $retryCount "/" $maxRetry
        retryCount=$((retryCount+1))
        sleep 10
        rep=$(curl -v "$httpUrl")
        status=$?
    done

    if [ "$status" -ne 0 ]; then
        echo "*** [$(date)] Not connected after" $retryCount " retries."
        return 1
    fi

    if [ "$JHI_PROTRACTOR" != 1 ]; then
        return 0
    fi

    retryCount=0
    maxRetry=1
    until [ "$retryCount" -ge "$maxRetry" ]
    do
        result=0
        if [[ -f "tsconfig.json" ]]; then
            npm run e2e
        fi
        result=$?
        [ $result -eq 0 ] && break
        retryCount=$((retryCount+1))
        echo "*** e2e tests failed... retryCount =" $retryCount "/" $maxRetry
        sleep 15
    done
    return $result
}

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------
if [ "$JHI_RUN_APP" == 1 ]; then
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        cd "$JHI_FOLDER_UAA"
        java \
            -jar app.jar \
            --spring.profiles.active=dev \
            --logging.level.ROOT=OFF \
            --logging.level.org.zalando=OFF \
            --logging.level.io.github.jhipster=OFF \
            --logging.level.io.github.jhipster.sample=OFF &
        sleep 80
    fi

    cd "$JHI_FOLDER_APP"
    # Run the app packaged as war/jar
    if [[ "$JHI_WAR" == 1 ]]; then
        java \
            -jar app.war \
            --spring.profiles.active="$JHI_PROFILE" \
            --logging.level.ROOT=OFF \
            --logging.level.org.zalando=OFF \
            --logging.level.org.springframework.web=ERROR \
            --logging.level.io.github.jhipster=OFF \
            --logging.level.io.github.jhipster.sample=OFF &
            echo $! > .pidRunApp
    else
        java \
            -jar app.jar \
            --spring.profiles.active="$JHI_PROFILE" \
            --logging.level.ROOT=OFF \
            --logging.level.org.zalando=OFF \
            --logging.level.org.springframework.web=ERROR \
            --logging.level.io.github.jhipster=OFF \
            --logging.level.io.github.jhipster.sample=OFF &
        echo $! > .pidRunApp
    fi
    sleep 40

    launchCurlOrProtractor
    resultRunApp=$?
    kill $(cat .pidRunApp)

    exit $((resultRunApp))
fi

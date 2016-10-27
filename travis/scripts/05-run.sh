#!/bin/bash

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
launchCurlOrProtractor() {
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8080"

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
        exit 1
    fi

    if [ "$PROTRACTOR" == 1 ]; then
        echo "[$(date)] Connected to application. Start protractor tests."
        gulp itest --no-notification
    fi
}

#-------------------------------------------------------------------------------
# Package UAA
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" == "app-gateway-uaa" ]; then
    cd "$HOME"/uaa
    ./mvnw package -DskipTests=true -P"$PROFILE"
fi

#-------------------------------------------------------------------------------
# Package the application
#-------------------------------------------------------------------------------
cd "$HOME"/app

if [ -f "mvnw" ]; then
    ./mvnw package -DskipTests=true -P"$PROFILE"
    mv target/*.war app.war
elif [ -f "gradlew" ]; then
    ./gradlew bootRepackage -P"$PROFILE" -x test
    mv build/libs/*.war app.war
else
    echo "No mvnw or gradlew"
    exit 0
fi
if [ $? -ne 0 ]; then
    echo "Error when packaging"
    exit 1
fi

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------
if [ "$RUN_APP" == 1 ]; then
    if [ "$JHIPSTER" == "app-gateway-uaa" ]; then
        cd "$HOME"/uaa
        java -jar target/*.war --spring.profiles.active="$PROFILE" &
        sleep 80
    fi

    cd "$HOME"/app
    java -jar app.war --spring.profiles.active="$PROFILE" &
    sleep 40

    if [[ ("$JHIPSTER" != 'app-microservice-eureka') && ("$JHIPSTER" != 'app-microservice-consul') ]]; then
        launchCurlOrProtractor
    fi
fi

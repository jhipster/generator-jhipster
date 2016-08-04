#!/bin/bash

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
launchProtractor() {
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
      echo "[$(date)] Not connected after" $retryCount " retries. Abort protractor tests."
      exit 0
    fi

    echo "[$(date)] Connected to application. Start protractor tests."
    gulp itest --no-notification
}

#-------------------------------------------------------------------------------
# Start the application
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

if [ "$RUN_APP" == 1 ]; then
    java -jar app.war --spring.profiles.active="$PROFILE" &
    sleep 20
    #-------------------------------------------------------------------------------
    # Launch protractor tests
    #-------------------------------------------------------------------------------
    if [ "$PROTRACTOR" == 1 ]; then
        launchProtractor
    fi
fi

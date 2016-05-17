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
if [ "$RUN_APP" == 1 ]; then
  if [ "$JHIPSTER" != "app-gradle" ]; then
    ./mvnw package -DskipTests=true -P"$PROFILE"
    mv target/*.war target/app.war
    java -jar target/app.war --spring.profiles.active="$PROFILE" &
  else
    ./gradlew bootRepackage -P"$PROFILE" -x test
    mv build/libs/*.war build/libs/app.war
    java -jar build/libs/app.war --spring.profiles.active="$PROFILE" &
  fi
  sleep 20
  #-------------------------------------------------------------------------------
  # Launch protractor tests
  #-------------------------------------------------------------------------------
  if [ "$PROTRACTOR" == 1 ]; then
    launchProtractor
  fi
fi

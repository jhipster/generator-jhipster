#!/bin/bash
set -ev
#--------------------------------------------------
# Start the application
#--------------------------------------------------
cd $HOME/$JHIPSTER
if [ $RUNTASK == 1 ]; then
  if [ $PROTRACTOR == 1 ]; then
    export DISPLAY=:99.0
    /etc/init.d/xvfb start
  fi
  
  if [ $JHIPSTER != "app-gradle" ]; then
    mvn -P$PROFILE &
    if [ $PROFILE == "dev" ]; then
      sleep 60
    else
      sleep 120
    fi
    # curl --retry 10 --retry-delay 5 -I http://localhost:8080/ | grep "HTTP/1.1 200 OK"
    # fuser -k 8080/tcp ; sleep 10
  else
    ./gradlew -P$PROFILE &
    sleep 300
    # curl --retry 10 --retry-delay 5 -I http://localhost:8080/ | grep "HTTP/1.1 200 OK"
    # fuser -k 8080/tcp ; sleep 10
  fi
fi

if [ $PROTRACTOR == 1 ]; then
  grunt itest
fi

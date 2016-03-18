#!/bin/bash
set -ev
#--------------------------------------------------
# Launch tests
#--------------------------------------------------
cd "$HOME"/"$JHIPSTER"
if [ "$JHIPSTER" != "app-gradle" ]; then
  mvn test
else
  ./gradlew test
fi
if [ "$JHIPSTER" != "app-microservice" ]; then
  gulp test --no-notification
fi

#!/bin/bash
set -ev
#--------------------------------------------------
# Launch tests
#--------------------------------------------------
cd "$HOME"/app
if [ -f "mvnw" ]; then
  ./mvnw test
elif [ -f "gradlew" ]; then
  ./gradlew test
fi
if [ -f "gulpfile.js" ]; then
  gulp test --no-notification
fi

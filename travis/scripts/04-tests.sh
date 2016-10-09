#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Launch UAA tests
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" == "app-gateway-uaa" ]; then
    cd "$HOME"/uaa
    ./mvnw test
fi

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

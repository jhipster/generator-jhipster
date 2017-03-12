#!/bin/bash
set -e

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
cd "$APP_FOLDER"
if [ -f "mvnw" ]; then
    ./mvnw javadoc:javadoc
elif [ -f "gradlew" ]; then
    ./gradlew javadoc
fi

#-------------------------------------------------------------------------------
# Launch UAA tests
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" == "app-ng2-gateway-uaa" ]; then
    cd "$UAA_APP_FOLDER"
    ./mvnw test
fi

#-------------------------------------------------------------------------------
# Launch tests
#-------------------------------------------------------------------------------
cd "$APP_FOLDER"
if [ -f "mvnw" ]; then
    ./mvnw test \
        -Dlogging.level.io.github.jhipster.sample=ERROR \
        -Dlogging.level.io.github.jhipster.travis=ERROR
elif [ -f "gradlew" ]; then
    ./gradlew test \
        -Dlogging.level.io.github.jhipster.sample=ERROR \
        -Dlogging.level.io.github.jhipster.travis=ERROR
fi
if [ -f "gulpfile.js" ]; then
    gulp test --no-notification
fi
if [ -f "tsconfig.json" ]; then
    yarn run test
fi

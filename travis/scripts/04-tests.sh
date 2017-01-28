#!/bin/bash

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
if [ -f "mvnw" ]; then
    ./mvnw javadoc:javadoc
elif [ -f "gradlew" ]; then
    ./gradlew javadoc
fi

#-------------------------------------------------------------------------------
# Launch UAA tests
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" == "app-ng2-gateway-uaa" ]; then
    cd "$HOME"/uaa
    ./mvnw test
fi

#-------------------------------------------------------------------------------
# Launch tests
#-------------------------------------------------------------------------------
cd "$HOME"/app
if [ -f "mvnw" ]; then
    ./mvnw test -Dspring.jpa.show-sql=false
elif [ -f "gradlew" ]; then
    ./gradlew test -Dspring.jpa.show-sql=false
fi
if [ -f "gulpfile.js" ]; then
    gulp test --no-notification
fi
if [ -f "tsconfig.json" ]; then
    yarn run test
fi

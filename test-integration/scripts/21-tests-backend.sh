#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Display environment information like JDK version
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "mvnw" ]; then
    ./mvnw enforcer:display-info
elif [ -f "gradlew" ]; then
    ./gradlew -v
fi

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
if [[ "$JHI_APP" == *"uaa"* ]]; then
    cd "$JHI_FOLDER_UAA"
    ./mvnw verify
fi

#-------------------------------------------------------------------------------
# Launch tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "mvnw" ]; then
    ./mvnw verify \
        -Dlogging.level.ROOT=OFF \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.io.github.jhipster=OFF \
        -Dlogging.level.io.github.jhipster.sample=OFF \
        -Dlogging.level.io.github.jhipster.travis=OFF \
        -Dlogging.level.org.springframework=OFF \
        -Dlogging.level.org.springframework.web=OFF \
        -Dlogging.level.org.springframework.security=OFF

elif [ -f "gradlew" ]; then
    ./gradlew test integrationTest \
        -Dlogging.level.ROOT=OFF \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.io.github.jhipster=OFF \
        -Dlogging.level.io.github.jhipster.sample=OFF \
        -Dlogging.level.io.github.jhipster.travis=OFF \
        -Dlogging.level.org.springframework=OFF \
        -Dlogging.level.org.springframework.web=OFF \
        -Dlogging.level.org.springframework.security=OFF
fi

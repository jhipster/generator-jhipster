#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Display environment information like JDK version
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "mvnw" ]; then
    ./mvnw -ntp enforcer:display-info --batch-mode
elif [ -f "gradlew" ]; then
    ./gradlew -v
fi

#-------------------------------------------------------------------------------
# Exclude webpack task from Gradle if not skipping client
#-------------------------------------------------------------------------------
JHI_GRADLE_EXCLUDE_WEBPACK="-x webapp"
if [[ $(grep "\"skipClient\": true" .yo-rc.json) != "" ]]; then
    JHI_GRADLE_EXCLUDE_WEBPACK=""
fi

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
if [ -f "mvnw" ]; then
    ./mvnw -ntp javadoc:javadoc --batch-mode
elif [ -f "gradlew" ]; then
    ./gradlew javadoc $JHI_GRADLE_EXCLUDE_WEBPACK
fi

#-------------------------------------------------------------------------------
# Check no-http
#-------------------------------------------------------------------------------
if [ -f "mvnw" ]; then
    ./mvnw -ntp checkstyle:check --batch-mode
elif [ -f "gradlew" ]; then
    ./gradlew checkstyleNohttp $JHI_GRADLE_EXCLUDE_WEBPACK
fi

#-------------------------------------------------------------------------------
# Enable testcontainers profiles
#-------------------------------------------------------------------------------
JHI_GRADLE_ENABLE_TESTCONTAINERS=""
JHI_MAVEN_ENABLE_TESTCONTAINERS=""
if [ "$JHI_TESTCONTAINERS" == 1 ]; then
    JHI_GRADLE_ENABLE_TESTCONTAINERS="-Ptestcontainers"
    JHI_MAVEN_ENABLE_TESTCONTAINERS="-Dspring.profiles.active=testcontainers"
fi

#-------------------------------------------------------------------------------
# Launch tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "mvnw" ]; then
    ./mvnw -ntp -P-webapp verify $JHI_MAVEN_ENABLE_TESTCONTAINERS --batch-mode \
        -Dlogging.level.ROOT=OFF \
        -Dlogging.level.org.testcontainers=INFO \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.tech.jhipster=OFF \
        -Dlogging.level.tech.jhipster.sample=OFF \
        -Dlogging.level.org.springframework=OFF \
        -Dlogging.level.org.springframework.web=OFF \
        -Dlogging.level.org.springframework.security=OFF

elif [ -f "gradlew" ]; then
    ./gradlew test integrationTest $JHI_GRADLE_EXCLUDE_WEBPACK $JHI_GRADLE_ENABLE_TESTCONTAINERS \
        -Dlogging.level.ROOT=OFF \
        -Dlogging.level.org.testcontainers=INFO \
        -Dlogging.level.org.zalando=OFF \
        -Dlogging.level.tech.jhipster=OFF \
        -Dlogging.level.tech.jhipster.sample=OFF \
        -Dlogging.level.org.springframework=OFF \
        -Dlogging.level.org.springframework.web=OFF \
        -Dlogging.level.org.springframework.security=OFF
fi

#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$JHI_FOLDER_APP"

#-------------------------------------------------------------------------------
# Package the application
#-------------------------------------------------------------------------------
if [ "$JHI_WAR" == 1 ]; then
    if [ -f "mvnw" ]; then
        ./mvnw -ntp verify -DskipTests -P"$JHI_PROFILE",war --batch-mode
        mv target/*.war app.war
    elif [ -f "gradlew" ]; then
        ./gradlew bootWar -P"$JHI_PROFILE" -Pwar -x test
        mv build/libs/*SNAPSHOT.war app.war
    else
        echo "*** no mvnw or gradlew"
        exit 0
    fi
    if [ $? -ne 0 ]; then
        echo "*** error when packaging"
        exit 1
    fi
else
    if [ -f "mvnw" ]; then
        ./mvnw -ntp verify -DskipTests -P"$JHI_PROFILE" --batch-mode
        mv target/*.jar app.jar
    elif [ -f "gradlew" ]; then
        ./gradlew bootJar -P"$JHI_PROFILE" -x test
        mv build/libs/*SNAPSHOT.jar app.jar
    else
        echo "*** no mvnw or gradlew"
        exit 0
    fi
    if [ $? -ne 0 ]; then
        echo "*** error when packaging"
        exit 1
    fi
fi

#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Package UAA
#-------------------------------------------------------------------------------
if [[ "$JHI_APP" == *"uaa"* ]]; then
    cd "$JHI_FOLDER_UAA"
    ./mvnw -ntp verify -DskipTests -Pdev --batch-mode
    mv target/*.jar app.jar
fi

#-------------------------------------------------------------------------------
# Decrease Angular timeout for Protractor tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ "$JHI_PROTRACTOR" == 1 ] && [ -e "src/main/webapp/app/core/core.module.ts" ]; then
    sed -e 's/alertTimeout: 5000/alertTimeout: 1/1;' src/main/webapp/app/core/core.module.ts > src/main/webapp/app/core/core.module.ts.sed
    mv -f src/main/webapp/app/core/core.module.ts.sed src/main/webapp/app/core/core.module.ts
    cat src/main/webapp/app/core/core.module.ts | grep alertTimeout
fi

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

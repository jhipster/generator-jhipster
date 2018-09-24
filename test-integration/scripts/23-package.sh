#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Package UAA
#-------------------------------------------------------------------------------
if [[ "$JH_APP" == *"uaa"* ]]; then
    cd "$JH_FOLDER_UAA"
    ./mvnw verify -DskipTests -P"$JH_PROFILE"
fi

#-------------------------------------------------------------------------------
# Decrease Angular timeout for Protractor tests
#-------------------------------------------------------------------------------
if [ "$JH_PROTRACTOR" == 1 ] && [ -e "src/main/webapp/app/shared/shared-libs.module.ts" ]; then
    sed -e 's/alertAsToast: false,/alertAsToast: false, alertTimeout: 1,/1;' src/main/webapp/app/shared/shared-libs.module.ts > src/main/webapp/app/shared/shared-libs.module.ts.sed
    mv -f src/main/webapp/app/shared/shared-libs.module.ts.sed src/main/webapp/app/shared/shared-libs.module.ts
    cat src/main/webapp/app/shared/shared-libs.module.ts | grep alertTimeout
fi

#-------------------------------------------------------------------------------
# Package the application
#-------------------------------------------------------------------------------
cd "$JH_FOLDER_APP"

if [ -f "mvnw" ]; then
    ./mvnw verify -DskipTests -P"$JH_PROFILE"
    mv target/*.war app.war
elif [ -f "gradlew" ]; then
    ./gradlew bootWar -P"$JH_PROFILE" -x test
    mv build/libs/*.war app.war
else
    echo "No mvnw or gradlew"
    exit 0
fi
if [ $? -ne 0 ]; then
    echo "Error when packaging"
    exit 1
fi

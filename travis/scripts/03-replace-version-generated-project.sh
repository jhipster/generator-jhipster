#!/bin/bash

if [[ "$JHIPSTER_LIB_BRANCH" == "release" ]]; then
    echo "No need to change version in generated project"
    exit 0
fi

if [[ $JHIPSTER_VERSION == '' ]]; then
    JHIPSTER_VERSION=0.0.0-TRAVIS
fi

# jhipster-framework.version in generated pom.xml or gradle.properties
cd "$APP_FOLDER"
if [[ -a mvnw ]]; then
    sed -e 's/<jhipster-framework.version>.*<\/jhipster-framework.version>/<jhipster-framework.version>'$JHIPSTER_VERSION'<\/jhipster-framework.version>/1;' pom.xml > pom.xml.sed
    mv -f pom.xml.sed pom.xml
    cat pom.xml | grep \<jhipster-framework.version\>

elif [[ -a gradlew ]]; then
    sed -e 's/jhipster_framework_version=.*/jhipster_framework_version='$JHIPSTER_VERSION'/1;' gradle.properties > gradle.properties.sed
    mv -f gradle.properties.sed gradle.properties
    cat gradle.properties | grep jhipster_framework_version=

fi

#!/bin/bash

if [[ "$JHIPSTER_LIB_BRANCH" == "release" ]]; then
    echo "No need to change version in generated project"
    exit 0
fi

if [[ $JHIPSTER_VERSION == '' ]]; then
    JHIPSTER_VERSION=0.0.0-TRAVIS
fi

# jhipster-dependencies.version in generated pom.xml or gradle.properties
cd "$APP_FOLDER"
if [[ -a mvnw ]]; then
    sed -e 's/<jhipster-dependencies.version>.*<\/jhipster-dependencies.version>/<jhipster-dependencies.version>'$JHIPSTER_VERSION'<\/jhipster-dependencies.version>/1;' pom.xml > pom.xml.sed
    mv -f pom.xml.sed pom.xml
    cat pom.xml | grep \<jhipster-dependencies.version\>

elif [[ -a gradlew ]]; then
    sed -e 's/jhipster_dependencies_version=.*/jhipster_dependencies_version='$JHIPSTER_VERSION'/1;' gradle.properties > gradle.properties.sed
    mv -f gradle.properties.sed gradle.properties
    cat gradle.properties | grep jhipster_dependencies_version=

fi

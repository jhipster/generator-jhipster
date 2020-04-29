#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh


if [[ "$JHI_LIB_BRANCH" == "release" ]]; then
    echo "*** no need to change version in generated project"
    exit 0
fi

if [[ $JHI_VERSION == '' ]]; then
    JHI_VERSION=0.0.0-CICD
fi

# replace version in uaa
if [[ "$JHI_APP" == *"uaa"* ]]; then
    cd "$JHI_FOLDER_UAA"
    sed -e 's/<jhipster-dependencies.version>.*<\/jhipster-dependencies.version>/<jhipster-dependencies.version>'$JHI_VERSION'<\/jhipster-dependencies.version>/1;' pom.xml > pom.xml.sed
    mv -f pom.xml.sed pom.xml
    cat pom.xml | grep \<jhipster-dependencies.version\>
fi

# jhipster-dependencies.version in generated pom.xml or gradle.properties
cd "$JHI_FOLDER_APP"
if [[ -a mvnw ]]; then
    sed -e 's/<jhipster-dependencies.version>.*<\/jhipster-dependencies.version>/<jhipster-dependencies.version>'$JHI_VERSION'<\/jhipster-dependencies.version>/1;' pom.xml > pom.xml.sed
    mv -f pom.xml.sed pom.xml
    cat pom.xml | grep \<jhipster-dependencies.version\>

elif [[ -a gradlew ]]; then
    sed -e 's/jhipster_dependencies_version=.*/jhipster_dependencies_version='$JHI_VERSION'/1;' gradle.properties > gradle.properties.sed
    mv -f gradle.properties.sed gradle.properties
    cat gradle.properties | grep jhipster_dependencies_version=

fi

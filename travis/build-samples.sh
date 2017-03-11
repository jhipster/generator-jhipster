#!/bin/bash

set -e

trap ctrl_c INT

function ctrl_c() {
    exit 1
}

function usage() {
    me=$(basename "$0")
    echo
    echo "Usage: $me build|clean [sample_name]"
    echo
    exit 2
}

function generateProject() {
    dir=$1
    JHIPSTER=$dir
    APP_FOLDER="$JHIPSTER_SAMPLES/$dir"
    echo "*********************** Copying entities for $dir"
    source ./scripts/01-generate-entities.sh
    echo "*********************** Building $dir"
    pushd "$APP_FOLDER"
    yarn link generator-jhipster
    yo jhipster --force --no-insight --skip-checks --with-entities
    popd
}

function buildProject() {
    dir=$1
    JHIPSTER=$dir
    APP_FOLDER="$JHIPSTER_SAMPLES/$dir"
    generateProject "$1"
    pushd "$APP_FOLDER"
    echo "*********************** Testing $dir"
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
    popd
}

function cleanProject() {
    dir=$1
    echo "*********************** Cleaning $dir"
    pushd "$JHIPSTER_SAMPLES/$dir"
    ls -a | grep -v .yo-rc.json | xargs rm -rf | true
    popd
}

mydir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
JHIPSTER_SAMPLES="$mydir/samples"

if [ "$1" = "build" ]; then
    if [ "$2" != "" ]; then
        buildProject "$2"
    else
        for dir in $(ls -1 "$JHIPSTER_SAMPLES"); do
            if [ -f "$JHIPSTER_SAMPLES/$dir/.yo-rc.json" ]; then
                buildProject "$dir"
            else
                echo "$dir: Not a JHipster project. Skipping"
            fi
        done
    fi
elif [ "$1" = "generate" ]; then
    if [ "$2" != "" ]; then
        generateProject "$2"
    else
        for dir in $(ls -1 "$JHIPSTER_SAMPLES"); do
            if [ -f "$JHIPSTER_SAMPLES/$dir/.yo-rc.json" ]; then
                generateProject "$dir"
            else
                echo "$dir: Not a JHipster project. Skipping"
            fi
        done
    fi
elif [ "$1" = "clean" ]; then
    if [ "$2" != "" ]; then
        cleanProject "$2"
    else
        for dir in $(ls -1 "$JHIPSTER_SAMPLES"); do
            if [ -f "$JHIPSTER_SAMPLES/$dir/.yo-rc.json" ]; then
                cleanProject "$dir"
            else
                echo "$dir: Not a JHipster project. Skipping"
            fi
        done
    fi
else
    usage
fi

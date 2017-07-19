#!/bin/bash

set -e

trap ctrl_c INT

function ctrl_c() {
    exit 1
}

function usage() {
    me=$(basename "$0")
    echo
    echo "Usage: $me generate|build|clean [sample_name]"
    echo
    exit 2
}

function generateProject() {
    cd "$mydir"
    dir=$1
    JHIPSTER=$dir
    APP_FOLDER="$JHIPSTER_SAMPLES/$dir-sample"
    UAA_APP_FOLDER="$JHIPSTER_SAMPLES/$uaa-sample"
    echo "*********************** Copying entities for $dir-sample"
    source ./scripts/01-generate-entities.sh
    echo "*********************** Building $dir-sample"
    source ./scripts/02-generate-project.sh
    cd "$mydir"
}

function buildProject() {
    cd "$mydir"
    dir=$1
    JHIPSTER=$dir
    APP_FOLDER="$JHIPSTER_SAMPLES/$dir-sample"
    UAA_APP_FOLDER="$JHIPSTER_SAMPLES/$uaa-sample"
    generateProject "$1"
    echo "*********************** Testing $dir-sample"
    source ./scripts/04-tests.sh
    cd "$mydir"
}

function cleanProject() {
    dir=$1
    echo "*********************** Cleaning $dir"
    rm -rf "$JHIPSTER_SAMPLES/$dir"
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
        cleanProject "$2-sample"
    else
        for dir in $(ls -1 "$JHIPSTER_SAMPLES"); do
            if [ -f "$JHIPSTER_SAMPLES/$dir-sample/.yo-rc.json" ]; then
                cleanProject "$dir-sample"
            else
                echo "$dir-sample: Not a JHipster project. Skipping"
            fi
        done
    fi
else
    usage
fi

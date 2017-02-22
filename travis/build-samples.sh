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

function buildProject() {
    dir=$1
    echo "*********************** Building $dir"
    pushd "$mydir/samples/$dir"
    yo jhipster --force
    npm link generator-jhipster
    if [ -f pom.xml ]; then
        ./mvnw verify
    else
        ./gradlew test
    fi
    popd
}

function cleanProject() {
    dir=$1
    echo "*********************** Cleaning $dir"
    pushd "$mydir/samples/$dir"
    ls -a | grep -v .yo-rc.json | xargs rm -rf | true
    popd
}

mydir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$1" = "build" ]; then
    if [ "$2" != "" ]; then
        buildProject "$2"
    else
        for dir in $(ls -1 "$mydir/samples"); do
            buildProject "$dir"
        done
    fi
elif [ "$1" = "clean" ]; then
    if [ "$2" != "" ]; then
        cleanProject "$2"
    else
        for dir in $(ls -1 "$mydir/samples"); do
            cleanProject "$dir"
        done
    fi
else
    usage
fi

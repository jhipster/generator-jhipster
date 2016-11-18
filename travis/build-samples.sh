#!/bin/bash

set -e

trap ctrl_c INT

function ctrl_c() {
    exit 1
}

function usage() {
    me=$(basename "$0")
    echo
    echo "Usage: $me build|clean"
    echo
    exit 2
}

mydir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$1" = "build" ]; then

    for dir in $(ls -1 "$mydir/samples"); do
        echo "*********************** Building $dir"
        pushd "$mydir/samples/$dir"
        npm link generator-jhipster
        yo jhipster --force
        if [ -f pom.xml ]; then
            ./mvnw verify
        else
            ./gradlew test
        fi
        popd
    done

elif [ "$1" = "clean" ]; then

    for dir in $(ls -1 "$mydir/samples"); do
        echo "*********************** Cleaning $dir"
        pushd "$mydir/samples/$dir"
        ls -a | grep -v .yo-rc.json | xargs rm -rf | true
        popd
    done

else
    usage
fi

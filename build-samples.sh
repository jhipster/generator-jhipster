#!/bin/bash

set -e

trap ctrl_c INT

function ctrl_c() {
    exit 1
}

for dir in $(ls -1 travis/samples); do
	echo "*********************** Running $dir"
	pushd "travis/samples/$dir"
	npm link generator-jhipster
    yo jhipster --force
    if [ -f pom.xml ]; then
        ./mvnw verify
    else
        ./gradlew test
    fi
	popd
done

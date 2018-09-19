#!/bin/bash

init_var() {
    result=""
    if [[ $1 != "" ]]; then
        result=$1
    elif [[ $2 != "" ]]; then
        result=$2
    fi
    echo $result
}

# folder where the repo is cloned
JH_HOME=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$TRAVIS_BUILD_DIR")

# uri of repo
JH_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$TRAVIS_REPO_SLUG")

# folder for test-integration
JH_INTEG="$JH_REPO"/test-integration

# folder for samples
JH_SAMPLES="$JH_INTEG"/samples

# folder for scripts
JH_SCRIPTS="$JH_INTEG"/scripts

# folder for app
JH_FOLDER_APP="$HOME"/app

# folder for uaa app
JH_FOLDER_UAA="$HOME"/uaa

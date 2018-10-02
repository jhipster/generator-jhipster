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

# uri of repo
JHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$TRAVIS_REPO_SLUG")

# folder where the repo is cloned
JHI_HOME=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$TRAVIS_BUILD_DIR")

# folder for test-integration
JHI_INTEG="$JHI_HOME"/test-integration

# folder for samples
JHI_SAMPLES="$JHI_INTEG"/samples

# folder for scripts
JHI_SCRIPTS="$JHI_INTEG"/scripts

# folder for app
JHI_FOLDER_APP="$HOME"/app

# folder for uaa app
JHI_FOLDER_UAA="$HOME"/uaa

#!/bin/bash

init_var() {
    result=""
    if [[ $1 != "" ]]; then
        result=$1
    elif [[ $2 != "" ]]; then
        result=$2
    elif [[ $3 != "" ]]; then
        result=$3
    fi
    echo $result
}

# uri of repo
JHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$TRAVIS_REPO_SLUG" "$GITHUB_WORKSPACE" )

# folder where the repo is cloned
JHI_HOME=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$TRAVIS_BUILD_DIR" "$GITHUB_WORKSPACE")

# folder for test-integration
if [[ "$JHI_INTEG" == "" ]]; then
    JHI_INTEG="$JHI_HOME"/test-integration
fi

# folder for samples
if [[ "$JHI_SAMPLES" == "" ]]; then
    JHI_SAMPLES="$JHI_INTEG"/samples
fi

# folder for scripts
if [[ "$JHI_SCRIPTS" == "" ]]; then
    JHI_SCRIPTS="$JHI_INTEG"/scripts
fi

# folder for app
if [[ "$JHI_FOLDER_APP" == "" ]]; then
    JHI_FOLDER_APP="$HOME"/app
fi

# folder for uaa app
if [[ "$JHI_FOLDER_UAA" == "" ]]; then
    JHI_FOLDER_UAA="$HOME"/uaa
fi

# set correct OpenJDK version
if [[ "$JHI_JDK" == "11" && "$JHI_GITHUB_CI" != "true" ]]; then
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

#!/usr/bin/env bash

JHI_DETECTED_DIR="$( cd "$( dirname $( dirname $( dirname "${BASH_SOURCE[0]}" ) ) )" >/dev/null 2>&1 && pwd )"

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
if [[ "$JHI_REPO" == "" ]]; then
    JHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$GITHUB_WORKSPACE" )
fi

# folder for generator-jhipster
if [[ "$JHI_HOME" == "" ]]; then
    JHI_HOME="$JHI_DETECTED_DIR"
fi

# folder for executable package (blueprints or generator-jhipster)
if [[ "$JHI_CLI_PACKAGE_PATH" == "" ]]; then
    if [[ "$JHI_CLI_PACKAGE" != "" && "$JHI_WORKSPACE" != "" ]]; then
        JHI_CLI_PACKAGE_PATH="$JHI_WORKSPACE/$JHI_CLI_PACKAGE"
    else
        JHI_CLI_PACKAGE_PATH="$JHI_HOME"
    fi
fi

# folder where the repo is cloned
if [[ "$JHI_REPO_PATH" == "" ]]; then
    JHI_REPO_PATH=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$GITHUB_WORKSPACE")
fi

if [[ "$JHI_LIB_HOME" == "" ]]; then
    if [[ "$JHI_REPO" == *"/jhipster-bom" ]]; then
        JHI_LIB_HOME="$JHI_REPO_PATH"
    else
        JHI_LIB_HOME="$HOME"/jhipster-bom
    fi
fi

# folder for test-integration
if [[ "$JHI_INTEG" == "" ]]; then
    JHI_INTEG="$JHI_HOME"/test-integration
fi

# folder for samples
if [[ "$JHI_SAMPLES" == "" ]]; then
    JHI_SAMPLES="$JHI_INTEG"/samples
fi

if [[ -d "$JHI_SAMPLES"/.jhipster ]]; then
    JHI_ENTITY_SAMPLES="$JHI_SAMPLES"/.jhipster
else
    JHI_ENTITY_SAMPLES="$JHI_HOME"/test-integration/samples/.jhipster
fi

# folder for jdls samples
if [[ "$JHI_JDL_SAMPLES" == "" ]]; then
    JHI_JDL_SAMPLES="$JHI_INTEG"/jdl-samples
fi

# folder for scripts
if [[ "$JHI_SCRIPTS" == "" ]]; then
    JHI_SCRIPTS="$JHI_INTEG"/scripts
fi

# folder for app
if [[ "$JHI_FOLDER_APP" == "" ]]; then
    JHI_FOLDER_APP="$HOME"/app
fi

# jdk version
if [[ "$JHI_JDK" == "" ]]; then
    JHI_JDK=$(grep -o "JAVA_VERSION = '[^']*'" $JHI_HOME/generators/generator-constants.mjs | cut -f2 -d "'")
fi

# set correct OpenJDK version
if [[ "$JHI_JDK" == "17" && "$JHI_GITHUB_CI" != "true" ]]; then
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

if [[ "$JHI_CLI" == "" ]]; then
    JHI_CLI=jhipster
fi

# node version
JHI_NODE_VERSION=$(grep -o "NODE_VERSION = '[^']*'" $JHI_HOME/generators/generator-constants.mjs | cut -f2 -d "'")

# npm version
JHI_NPM_VERSION=$(grep -o '"npm": "[^"]*"' $JHI_HOME/generators/common/templates/package.json | cut -f4 -d '"')

# generator-jhipster version
JHI_VERSION=$(grep -o '"version": "[^"]*"' $JHI_HOME/package.json | cut -f4 -d '"')

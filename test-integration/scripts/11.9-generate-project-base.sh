#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$JHI_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHI_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

export DIVERGE_VERSION="mshima/generator-jhipster#before_jhipster7"

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl ./

    npm install "$DIVERGE_VERSION"
    jhipster import-jdl *.jdl --no-insight --creation-timestamp 2019-10-25
    rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
    rm * .* || true

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cd "$JHI_FOLDER_UAA"

        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json ./
        npm install "$DIVERGE_VERSION"
        jhipster --force --no-insight --with-entities --skip-checks --from-cli --creation-timestamp 2019-10-25
        rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
        rm * .* || true
    fi

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json ./

    npm install "$DIVERGE_VERSION"
    jhipster --force --no-insight --skip-checks --with-entities --from-cli --creation-timestamp 2019-10-25
    rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
    rm * .* || true
fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

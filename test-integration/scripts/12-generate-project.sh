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

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    # Note: --no-insight doesn't work here
    # there is still the message: May JHipster anonymously report usage statistics to improve the tool over time? (Y/n)
    # so the CI is stuck with --no-insight
    jhipster import-jdl *.jdl --force-insight
    ls -al "$JHI_FOLDER_APP"

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json "$JHI_FOLDER_UAA"/
        cd "$JHI_FOLDER_UAA"
        jhipster --force --no-insight --with-entities --skip-checks --skip-git --skip-commit-hook --from-cli
        ls -al "$JHI_FOLDER_UAA"
    fi

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    jhipster --force --no-insight --skip-checks --with-entities --skip-git --skip-commit-hook --from-cli
    ls -al "$JHI_FOLDER_APP"

fi

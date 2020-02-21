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
    # Setup jhipster JDL parameters
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    JHI_PARAMS="import-jdl *.jdl --no-insight $JHI_PARAMS"

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json "$JHI_FOLDER_UAA"/
        cd "$JHI_FOLDER_UAA"
        jhipster --force --no-insight --with-entities --skip-checks --from-cli
        ls -al "$JHI_FOLDER_UAA"
    fi

    #-------------------------------------------------------------------------------
    # Setup jhipster parameters
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    JHI_PARAMS="--force --no-insight --skip-checks --with-entities --from-cli $JHI_PARAMS"

fi

#-------------------------------------------------------------------------------
# 'package_manager install' will install a released jhipster version.
# For reproducible build it must be ignored, so the app will be regenerated with same jhipster version.
#-------------------------------------------------------------------------------
if [ "$REPRODUCIBLE_TEST" == "true" ]; then
   JHI_PARAMS="$JHI_PARAMS --skip-install --creation-timestamp 2019-12-01"
fi

#-------------------------------------------------------------------------------
# Generate project with jhipster
#-------------------------------------------------------------------------------
jhipster $JHI_PARAMS

#-------------------------------------------------------------------------------
# Reproducible test
#-------------------------------------------------------------------------------
if [ "$REPRODUCIBLE_TEST" == "true" ]; then
    if [ "$JHI_ENTITY" == "jdl" ]; then
        jhipster $JHI_PARAMS --bail --creation-timestamp 2019-12-01
        echo "Done. JDL regeneration finished without any change"
    fi
    jhipster --no-insight --with-entities --bail
    echo "Done. Regeneration finished without any change"
fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

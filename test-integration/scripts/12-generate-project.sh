#!/usr/bin/env bash

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
    jhipster import-jdl *.jdl --no-insight $@

else
    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"

    if [[ "$JHI_GENERATE_SKIP_CONFIG" != "1" ]]; then
        cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    else
        echo "skipping config file"
    fi

    cd "$JHI_FOLDER_APP"
    jhipster --force --no-insight --skip-checks --with-entities $@

fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit || true

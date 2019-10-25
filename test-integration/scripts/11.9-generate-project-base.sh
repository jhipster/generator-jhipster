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
export TRASH_FOLDER="$HOME"/trash

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl ./

    npm install "$DIVERGE_VERSION"
    jhipster import-jdl *.jdl --no-insight --creation-timestamp 2019-10-25

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

        mkdir -p "$TRASH_FOLDER"/uaa
        mv src/ webpack/ .jhipster/ .mvn/ node_modules/ "$TRASH_FOLDER"/uaa || true
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
fi

mkdir -p "$TRASH_FOLDER"
mv src/ webpack/ .jhipster/ .mvn/ node_modules/ "$TRASH_FOLDER" || true
rm * .* || true

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

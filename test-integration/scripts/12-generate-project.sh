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

export DIVERGE_VERSION="jhipster/generator-jhipster#3b9bedb132e394e0d9ad995c93da7846c10cd0a6"

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl ./

    npm install "$DIVERGE_VERSION"
    jhipster import-jdl *.jdl --no-insight
    rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
    rm * .* || true

    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl ./
    jhipster import-jdl *.jdl --no-insight

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cd "$JHI_FOLDER_UAA"

        npm install "$DIVERGE_VERSION"
        jhipster --force --no-insight --with-entities --skip-checks --from-cli
        rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
        rm * .* || true

        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json ./
        jhipster --force --no-insight --with-entities --skip-checks --from-cli
        ls -al "$JHI_FOLDER_UAA"

        echo "========= Start git diff ========="
        git --no-pager diff HEAD
        echo "========= End git diff ========="
    fi

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json ./

    npm install "$DIVERGE_VERSION"
    jhipster --force --no-insight --skip-checks --with-entities --from-cli
    rm -rf src/ webpack/ .jhipster/ .mvn/ node_modules/
    rm * .* || true

    jhipster --force --no-insight --skip-checks --with-entities --from-cli

fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
echo "========= Start git diff ========="
git --no-pager diff HEAD
echo "========= End git diff ========="

ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

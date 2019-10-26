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
    cd "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl ./
    jhipster import-jdl *.jdl --no-insight --creation-timestamp 2019-10-25

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cd "$JHI_FOLDER_UAA"

        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json ./
        jhipster --force --no-insight --with-entities --skip-checks --from-cli --creation-timestamp 2019-10-25
        ls -al "$JHI_FOLDER_UAA"

        echo "========= Start git diff ========="
        git add * || true
        git --no-pager diff HEAD -- . ':(exclude)package-lock.json'
        echo "========= End git diff ========="

        echo "========= Verifing diff ========="
        git --no-pager diff --exit-code HEAD -- . ':(exclude)package-lock.json' ':(exclude).yo-rc.json' \
                ':(exclude).editorconfig' \
                ':(exclude)README.md' \
                ':(exclude)src/test/resources/config/application*.yml'\
                ':(exclude)src/main/resources/config/tls/keystore.p12'
        echo "========= Done verifing diff ========="
    fi

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cd "$JHI_FOLDER_APP"

    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json ./
    jhipster --force --no-insight --skip-checks --with-entities --from-cli --creation-timestamp 2019-10-25

fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
echo "========= Start git diff ========="
git add * || true
git --no-pager diff HEAD -- . ':(exclude)package-lock.json'
echo "========= End git diff ========="

echo "========= Verifing diff ========="
git --no-pager diff --exit-code HEAD -- . ':(exclude)package-lock.json' ':(exclude).yo-rc.json' \
        ':(exclude).editorconfig' \
        ':(exclude)README.md' \
        ':(exclude)src/test/resources/config/application*.yml'\
        ':(exclude)src/main/resources/config/tls/keystore.p12'
echo "========= Done verifing diff ========="

ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

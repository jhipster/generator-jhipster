#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$JH_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JH_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

#-------------------------------------------------------------------------------
# Generate UAA project with jhipster
#-------------------------------------------------------------------------------
if [[ "$JH_APP" == *"uaa"* ]]; then
    mkdir -p "$JH_FOLDER_UAA"
    cp -f "$JH_SAMPLES"/uaa/.yo-rc.json "$JH_FOLDER_UAA"/
    cd "$JH_FOLDER_UAA"
    jhipster --force --no-insight --with-entities --skip-checks --skip-git --skip-commit-hook --from-cli
    ls -al "$JH_FOLDER_UAA"
fi

#-------------------------------------------------------------------------------
# Generate project with jhipster
#-------------------------------------------------------------------------------
mkdir -p "$JH_FOLDER_APP"
cp -f "$JH_SAMPLES"/"$JH_APP"/.yo-rc.json "$JH_FOLDER_APP"/
cd "$JH_FOLDER_APP"
jhipster --force --no-insight --skip-checks --with-entities --skip-git --skip-commit-hook --from-cli
ls -al "$JH_FOLDER_APP"

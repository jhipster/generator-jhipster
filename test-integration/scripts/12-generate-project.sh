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

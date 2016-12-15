#!/bin/bash

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
mkdir -p "$HOME"/.config/configstore/
mv "$JHIPSTER_TRAVIS"/configstore/*.json "$HOME"/.config/configstore/

#-------------------------------------------------------------------------------
# Generate the project with yo jhipster
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" == "app-gateway-uaa" ]; then
    mkdir -p "$HOME"/uaa
    mv -f "$JHIPSTER_SAMPLES"/uaa/.yo-rc.json "$HOME"/uaa/
    cd "$HOME"/uaa
    yarn link generator-jhipster
    yo jhipster --force --no-insight --yarn --with-entities
    ls -al "$HOME"/uaa
fi

mkdir -p "$HOME"/app
mv -f "$JHIPSTER_SAMPLES"/"$JHIPSTER"/.yo-rc.json "$HOME"/app/
cd "$HOME"/app
yarn link generator-jhipster
yo jhipster --force --no-insight --skip-checks --yarn --with-entities
ls -al "$HOME"/app

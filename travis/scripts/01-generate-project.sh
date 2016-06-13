#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
mkdir -p "$HOME"/.config/configstore/
mv "$JHIPSTER_TRAVIS"/configstore/*.json "$HOME"/.config/configstore/

#-------------------------------------------------------------------------------
# Generate the project with yo jhipster
#-------------------------------------------------------------------------------
mkdir -p "$HOME"/app
mv -f "$JHIPSTER_SAMPLES"/"$JHIPSTER"/.yo-rc.json "$HOME"/app/
cd "$HOME"/app
npm link generator-jhipster
yo jhipster --force --no-insight --skip-checks
ls -al "$HOME"/app

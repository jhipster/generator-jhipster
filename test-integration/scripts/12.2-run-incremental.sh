#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$JHI_FOLDER_APP"
rm -rf node_modules/generator-jhipster

if [[ "$JHI_LIQUIBASE" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    cp -f "$JHI_SAMPLES"/"$JHI_APP"-update/*.jdl "$JHI_FOLDER_APP"/
    jhipster import-jdl *.jdl --no-insight --force --skip-install
else
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/liquibase.json "$JHI_FOLDER_APP"/
    jhipster versioned-database --apply liquibase.json --no-insight --force --skip-install
fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git add -N .
git diff -p

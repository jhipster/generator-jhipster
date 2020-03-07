#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$JHI_FOLDER_APP"
rm -rf node_modules/generator-jhipster

jhipster versioned-database --init --no-insight --force --skip-install
git add -N .
git diff -p
git commit -a -m "Initialize incremental changelog"

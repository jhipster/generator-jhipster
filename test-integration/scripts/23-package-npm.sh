#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$JHI_FOLDER_APP"

#-------------------------------------------------------------------------------
# Package the application
#-------------------------------------------------------------------------------
npm run ci:e2e:package

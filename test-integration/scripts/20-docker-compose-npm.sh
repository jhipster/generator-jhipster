#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Start docker containers
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"

npm run ci:e2e:prepare

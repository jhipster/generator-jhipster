#!/usr/bin/env bash

source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Launch e2e tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"

npm run ci:e2e:run --if-present

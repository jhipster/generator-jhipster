#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Launch frontend tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "tsconfig.json" ]; then
    if [ -f "angular.json" ]; then
        npm test
    else # for react
        npm run test-ci
    fi
fi

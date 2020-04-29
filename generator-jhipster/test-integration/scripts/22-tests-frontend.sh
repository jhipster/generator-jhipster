#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Launch frontend tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [[ $(grep yarn .yo-rc.json) != "" ]]; then
    JHI_CLIENT_PACKAGE_MANAGER=yarn
else
    JHI_CLIENT_PACKAGE_MANAGER=npm
fi

if [ -f "tsconfig.json" ]; then
    if [ -f "src/main/webapp/app/app.tsx" ]; then
        $JHI_CLIENT_PACKAGE_MANAGER run test-ci
    else
        $JHI_CLIENT_PACKAGE_MANAGER test
    fi
fi

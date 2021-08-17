#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Launch frontend tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
    JHI_CLIENT_PACKAGE_MANAGER=npm

if [ -f "tsconfig.json" ]; then
    if [ -f "src/main/webapp/app/app.tsx" ]; then
        $JHI_CLIENT_PACKAGE_MANAGER run test-ci
    else
        $JHI_CLIENT_PACKAGE_MANAGER test
    fi
fi

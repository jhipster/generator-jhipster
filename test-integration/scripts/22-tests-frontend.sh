#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Launch frontend tests
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -f "tsconfig.json" ]; then
    if [ -f "src/main/webapp/app/app.tsx" ]; then
        npm run test-ci
    else
        npm test
    fi
fi

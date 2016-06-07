#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Check the cache from Travis
#-------------------------------------------------------------------------------
if [ ! -f "$HOME"/.m2/cache.txt ]; then
    echo "No cache.txt, generate one for the next time"
    echo "[$(date)] $JHIPSTER" > "$HOME"/.m2/cache.txt
else
    echo "Found cache.txt"
    cat "$HOME"/.m2/cache.txt
fi

#!/usr/bin/env bash

# Orchestrate the automatic execution of all the cql migration scripts when starting the cluster

# Protect from iterating on empty directories
shopt -s nullglob

function log {
    echo "[$(date)]: $*"
}

function logDebug {
    ((DEBUG_LOG)) && echo "[DEBUG][$(date)]: $*"
}

function waitForClusterConnection() {
    log "waiting for cassandra connection..."
    retryCount=0
    maxRetry=20
    cqlsh -e "Describe KEYSPACES;" $CASSANDRA_CONTACT_POINT &>/dev/null
    while [ $? -ne 0 ] && [ "$retryCount" -ne "$maxRetry" ]; do
        logDebug 'cassandra not reachable yet. sleep and retry. retryCount =' $retryCount
        sleep 5
        ((retryCount+=1))
        cqlsh -e "Describe KEYSPACES;" $CASSANDRA_CONTACT_POINT &>/dev/null
    done

    if [ $? -ne 0 ]; then
      log "not connected after " $retryCount " retry. Abort the migration."
      exit 1
    fi

    log "connected to cassandra cluster"
}

waitForClusterConnection

log "execute cassandra setup and all migration scripts"

CQL_FILES_PATH="/cql/changelog/"
EXECUTE_CQL_SCRIPT="./usr/local/bin/execute-cql"
if [ "$#" -eq 1 ]; then
    log "overriding for local usage"
    CQL_FILES_PATH=$1
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    EXECUTE_CQL_SCRIPT=$SCRIPT_DIR'/execute-cql.sh'
else
    log "use $CREATE_KEYSPACE_SCRIPT script to create keyspace if necessary"
    cqlsh -f /cql/$CREATE_KEYSPACE_SCRIPT $CASSANDRA_CONTACT_POINT
fi

function executeScripts() {
    local filePattern=$1
    # loop over migration scripts
    for cqlFile in $filePattern; do
        . $EXECUTE_CQL_SCRIPT $cqlFile
    done
}

log "execute all non already executed scripts from $CQL_FILES_PATH"
executeScripts "$CQL_FILES_PATH*.cql"

log "migration done"

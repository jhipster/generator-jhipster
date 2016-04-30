#!/bin/bash

# Orchestrate the automatic execution of all the cql migration scripts when starting the cluster
# for local development

# Protect from iterating on empty directories
shopt -s nullglob

function log {
    echo "[$(date)]: $*"
}

function waitForClusterConnection() {
    retryCount=0
    maxRetry=20
    cqlsh -e "Describe KEYSPACES;" $CASSANDRA_CONTACT_POINT &>/dev/null
    while [ $? -ne 0 ] && [ "$retryCount" -ne "$maxRetry" ]; do
        log 'cassandra not reachable yet. sleep and retry. retryCount =' $retryCount
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

function executeScripts() {
    local filePattern=$1
    # loop over migration scripts
    for cqlFile in $filePattern; do
        . ./usr/local/bin/execute-cql $cqlFile
    done
}

waitForClusterConnection

log "execute cassandra setup and all migration scripts"

log "create keyspace and base tables"
. ./usr/local/bin/init-dev

log "apply all scripts from /cql/changelog/"
executeScripts "/cql/changelog/*.cql"

log "migration done"

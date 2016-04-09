#!/usr/bin/env bash

function log {
    echo "[$(date)]: $*"
}

KEYSPACE_NAME=<%= baseName.toLowerCase() %>

#usage checks
if [ -z "$1" ]; then
    echo "usage: ./execute-cql cqlFile.cql"
    exit 1
fi
if [ -z "$CASSANDRA_CONTACT_POINT" ]; then
    echo "CASSANDRA_CONTACT_POINT environment variable must be defined"
    exit 1
fi

cqlFile=$1

log "execute: " $cqlFile
cqlsh -k $KEYSPACE_NAME -f $cqlFile $CASSANDRA_CONTACT_POINT

if [ $? -ne 0 ]; then
    log "fail to apply script " $filename
    log "stop applying database changes"
    exit 1
fi

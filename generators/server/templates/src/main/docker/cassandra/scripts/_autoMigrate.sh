<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
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
    log "Waiting for Cassandra connection..."
    retryCount=0
    maxRetry=20
    cqlsh -e "Describe KEYSPACES;" $CASSANDRA_CONTACT_POINT &>/dev/null
    while [ $? -ne 0 ] && [ "$retryCount" -ne "$maxRetry" ]; do
        logDebug 'Cassandra not reachable yet. sleep and retry. retryCount =' $retryCount
        sleep 5
        ((retryCount+=1))
        cqlsh -e "Describe KEYSPACES;" $CASSANDRA_CONTACT_POINT &>/dev/null
    done

    if [ $? -ne 0 ]; then
      log "Not connected after " $retryCount " retry. Abort the migration."
      exit 1
    fi

    log "Connected to Cassandra cluster"
}

function executeScripts() {
    local filePattern=$1
    # loop over migration scripts
    for cqlFile in $filePattern; do
        . $EXECUTE_CQL_SCRIPT $cqlFile
    done
}

# parse arguments
if [ "$#" -gt 0 ]; then
    log "Override for local usage"
    CQL_FILES_PATH=$1
    CREATE_KEYSPACE_SCRIPT="create-keyspace.cql" # default create-keyspace script
    if [ "$#" -eq 2 ]; then
      CREATE_KEYSPACE_SCRIPT=$2
    fi
    CREATE_KEYSPACE_SCRIPT_FOLDER="$(dirname $CQL_FILES_PATH)"
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    EXECUTE_CQL_SCRIPT=$SCRIPT_DIR'/execute-cql.sh'
else
    CQL_FILES_PATH="/cql/changelog/"
    EXECUTE_CQL_SCRIPT="./usr/local/bin/execute-cql"
    CREATE_KEYSPACE_SCRIPT_FOLDER="/cql"
fi

log "Start Cassandra migration tool"
waitForClusterConnection
log "Use $CREATE_KEYSPACE_SCRIPT_FOLDER/$CREATE_KEYSPACE_SCRIPT script to create the keyspace if necessary"
cqlsh -f $CREATE_KEYSPACE_SCRIPT_FOLDER'/'$CREATE_KEYSPACE_SCRIPT $CASSANDRA_CONTACT_POINT
log "Execute all non already executed scripts from $CQL_FILES_PATH"
executeScripts "$CQL_FILES_PATH*.cql"
log "Migration done"

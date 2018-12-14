#!/bin/bash

set -e

trap ctrl_c INT

function ctrl_c() {
    exit 1
}

function usage() {
    me=$(basename "$0")
    echo
    echo "Usage: $me generate <destination> <sample_name> [sql|sqllight|sqlfull|micro|uaa|mongodb|cassandra|couchbase] | list"
    echo 
    echo "Examples:"
    echo "$me generate /tmp/ngx-default/ ngx-default sql"
    echo "$me generate /tmp/ngx-default/ ngx-session-cassandra-fr cassandra"
    echo
    exit 2
}

function generateProject() {
    cd "$mydir"

    echo "JHI_FOLDER_APP=$JHI_FOLDER_APP"
    echo "JHI_APP=$JHI_APP"
    echo "JHI_ENTITY=$JHI_ENTITY"
    
    if [ ! -d "$JHI_FOLDER_APP" ]; then
        echo "*** Create $JHI_FOLDER_APP"
        mkdir -p "$JHI_FOLDER_APP"
    fi
    if [ ! -z "$(ls -A $JHI_FOLDER_APP)" ]; then
        echo "*** The folder is not empty: $JHI_FOLDER_APP"
        exit 1
    else
        mkdir -p "$JHI_FOLDER_APP"/.jhipster/
        echo "*** Empty folder, let's generate JHipster project in: $JHI_FOLDER_APP"
    fi

    pushd scripts/
    echo "*********************** Copying entities for $JHI_APP"
    source ./11-generate-entities.sh
    popd

    echo "*********************** Copy configuration"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    ls -al "$JHI_FOLDER_APP"/
}

mydir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
JHI_SAMPLES="$mydir/samples"

if [ "$1" = "list" ]; then
    for dir in $(ls -1 "$JHI_SAMPLES"); do
        if [ -f "$JHI_SAMPLES/$dir/.yo-rc.json" ] && [[ $dir != *-sample ]]; then
            echo "$dir"
        fi
    done

elif [ "$1" = "generate" ]; then
    if [ "$3" != "" ]; then
        JHI_FOLDER_APP=$2
        JHI_APP=$3
        JHI_ENTITY=$4
        generateProject
    else
        usage
    fi

else
    usage
fi

#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$JHI_FOLDER_APP"
if [ -a src/main/docker/elasticsearch.yml ]; then
    sed -i -e 's/            - \"ES_JAVA_OPTS=-Xms1024m -Xmx1024m\"/        #     - \"ES_JAVA_OPTS=-Xms1024m -Xmx1024m\"/1;' src/main/docker/elasticsearch.yml
    cat src/main/docker/elasticsearch.yml
fi

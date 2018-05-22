#!/usr/bin/env bash

#  Copyright 2013-2018 the original author or authors from the JHipster project.
#
# This file is part of the JHipster project, see https://www.jhipster.tech/
# for more information.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -exu
function echoSetX() {
    echo -e "\\n----------------------------------------------------------\\n" \
        "\\n$1\\n" \
        "\\n--------------------------------------------------------------\\n"
}

#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
set +x
echoSetX "Start docker container"
set -x

cd "$APP_FOLDER"
if [ -a src/main/docker/jhipster-registry.yml ]; then
    docker-compose -f src/main/docker/jhipster-registry.yml \
        --project-name "$DOCKER_PREFIX_NAME"registery up -d
fi
if [ -a src/main/docker/consul.yml ]; then
    docker-compose -f src/main/docker/consul.yml \
        --project-name "$DOCKER_PREFIX_NAME"consul up -d
fi
if [ -a src/main/docker/cassandra.yml ]; then
    docker-compose -f src/main/docker/cassandra.yml \
        --project-name "$DOCKER_PREFIX_NAME"cassandra up -d
fi
if [ -a src/main/docker/mongodb.yml ]; then
    docker-compose -f src/main/docker/mongodb.yml \
        --project-name "$DOCKER_PREFIX_NAME"mongodb up -d
fi
if [ -a src/main/docker/couchbase.yml ]; then
    echo "This container can't be started otherwise, " \
        "it will be conflict with tests. So it is done in 05-run.sh"
fi
if [ -a src/main/docker/mysql.yml ]; then
    docker-compose -f src/main/docker/mysql.yml \
        --project-name "$DOCKER_PREFIX_NAME"mysql up -d
fi
if [ -a src/main/docker/postgresql.yml ]; then
    docker-compose -f src/main/docker/postgresql.yml \
        --project-name "$DOCKER_PREFIX_NAME"postgresql up -d
fi
if [ -a src/main/docker/elasticsearch.yml ]; then
    docker-compose -f src/main/docker/elasticsearch.yml \
        --project-name "$DOCKER_PREFIX_NAME"elasticsearch up -d
fi
if [ -a src/main/docker/mariadb.yml ]; then
    docker-compose -f src/main/docker/mariadb.yml \
        --project-name "$DOCKER_PREFIX_NAME"mariadb up -d
fi
if [ -a src/main/docker/kafka.yml ]; then
    docker-compose -f src/main/docker/kafka.yml \
        --project-name "$DOCKER_PREFIX_NAME"kafka up -d
fi
if [ -a src/main/docker/keycloak.yml ]; then
    docker-compose -f src/main/docker/keycloak.yml \
        --project-name "$DOCKER_PREFIX_NAME"keycloak up -d
fi

if [[ "$IS_TRAVIS_CI" -eq 0 ]]  ; then
    # If it's ../build-samples.sh and not Travis CI
    docker ps -a --filter "name=jhipster-travis-build*"
else
    docker ps -a
fi

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

set -ex
function echoSetX() {
    echo -e "\n-------------------------------------------------------------------------------\n" \
        "\n$1\n" \
        "\n-------------------------------------------------------------------------------\n"
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
        --project-name jhipster-travis-build-registery up -d
fi
if [ -a src/main/docker/consul.yml ]; then
    docker-compose -f src/main/docker/consul.yml \
        --project-name jhipster-travis-build-consul up -d
fi
if [ -a src/main/docker/cassandra.yml ]; then
    docker-compose -f src/main/docker/cassandra.yml \
        --project-name jhipster-travis-build-cassandra up -d
fi
if [ -a src/main/docker/mongodb.yml ]; then
    docker-compose -f src/main/docker/mongodb.yml \
        --project-name jhipster-travis-build-mongodb up -d
fi
if [ -a src/main/docker/couchbase.yml ]; then
    # this container can't be started otherwise, it will be conflict with tests
    # so here, only prepare the image
    docker-compose -f src/main/docker/couchbase.yml \
        --project-name jhipster-travis-build-couchbase build -d
fi
if [ -a src/main/docker/mysql.yml ]; then
    docker-compose -f src/main/docker/mysql.yml \
        --project-name jhipster-travis-build-mysql up -d
fi
if [ -a src/main/docker/postgresql.yml ]; then
    docker-compose -f src/main/docker/postgresql.yml \
        --project-name jhipster-travis-build-postgresql up -d
fi
if [ -a src/main/docker/elasticsearch.yml ]; then
    docker-compose -f src/main/docker/elasticsearch.yml \
        --project-name jhipster-travis-build-elasticsearch up -d
fi
if [ -a src/main/docker/mariadb.yml ]; then
    docker-compose -f src/main/docker/mariadb.yml \
        --project-name jhipster-travis-build-mariadb up -d
fi
if [ -a src/main/docker/kafka.yml ]; then
    docker-compose -f src/main/docker/kafka.yml \
        --project-name jhipster-travis-build-kafka up -d
fi
if [ -a src/main/docker/keycloak.yml ]; then
    docker-compose -f src/main/docker/keycloak.yml \
        --project-name jhipster-travis-build-keycloak up -d
fi

docker ps -a

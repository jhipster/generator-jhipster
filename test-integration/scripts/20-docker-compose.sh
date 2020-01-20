#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd "$JHI_FOLDER_APP"
if [ -a src/main/docker/keycloak.yml ]; then
    docker-compose -f src/main/docker/keycloak.yml up -d
fi
if [ -a src/main/docker/elasticsearch.yml ]; then
    docker-compose -f src/main/docker/elasticsearch.yml up -d
fi
if [ -a src/main/docker/kafka.yml ]; then
    docker-compose -f src/main/docker/kafka.yml up -d
fi
if [ -a src/main/docker/consul.yml ]; then
    docker-compose -f src/main/docker/consul.yml up -d
fi
if [ -a src/main/docker/cassandra.yml ]; then
    docker-compose -f src/main/docker/cassandra.yml up -d
fi
if [ -a src/main/docker/mongodb.yml ]; then
    docker-compose -f src/main/docker/mongodb.yml up -d
fi
if [ -a src/main/docker/couchbase.yml ]; then
    # this container can't be started otherwise, it will be conflict with tests
    # so here, only prepare the image
    docker-compose -f src/main/docker/couchbase.yml build
fi
if [ -a src/main/docker/mysql.yml ]; then
    docker-compose -f src/main/docker/mysql.yml up -d
fi
if [ -a src/main/docker/postgresql.yml ]; then
    docker-compose -f src/main/docker/postgresql.yml up -d
fi
if [ -a src/main/docker/mariadb.yml ]; then
    docker-compose -f src/main/docker/mariadb.yml up -d
fi
if [ -a src/main/docker/redis.yml ]; then
    docker-compose -f src/main/docker/redis.yml up -d
fi
if [ -a src/main/docker/memcached.yml ]; then
    docker-compose -f src/main/docker/memcached.yml up -d
fi
if [ -a src/main/docker/jhipster-registry.yml ]; then
    docker-compose -f src/main/docker/jhipster-registry.yml up -d
fi
if [ "$JHI_SONAR" = 1 ]; then
    docker-compose -f src/main/docker/sonar.yml up -d
fi
docker ps -a

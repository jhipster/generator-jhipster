#!/bin/bash
set -e

#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd "$APP_FOLDER"
if [ -a src/main/docker/jhipster-registry.yml ]; then
    docker-compose -f src/main/docker/jhipster-registry.yml up -d
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
if [ -a src/main/docker/mysql.yml ]; then
    docker-compose -f src/main/docker/mysql.yml up -d
fi
if [ -a src/main/docker/postgresql.yml ]; then
    docker-compose -f src/main/docker/postgresql.yml up -d
fi
if [ -a src/main/docker/elasticsearch.yml ]; then
    docker-compose -f src/main/docker/elasticsearch.yml up -d
fi
if [ -a src/main/docker/mariadb.yml ]; then
    docker-compose -f src/main/docker/mariadb.yml up -d
fi
if [ -a src/main/docker/kafka.yml ]; then
    docker-compose -f src/main/docker/kafka.yml up -d
fi

docker ps -a

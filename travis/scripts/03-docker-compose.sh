#!/bin/bash

#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd "$HOME"/app
if [[ ("$JHIPSTER" == 'app-ng2-cassandra') && (-a src/main/docker/cassandra.yml) ]]; then
    docker-compose -f src/main/docker/cassandra.yml up -d

elif [[ ("$JHIPSTER" == 'app-ng2-mongodb') && (-a src/main/docker/mongodb.yml) ]]; then
    docker-compose -f src/main/docker/mongodb.yml up -d

elif [[ ("$JHIPSTER" == 'app-mysql') && (-a src/main/docker/mysql.yml) ]]; then
    docker-compose -f src/main/docker/mysql.yml up -d

elif [[ ("$JHIPSTER" == 'app-psql-es-noi18n') || ("$JHIPSTER" == 'app-ng2-jwt') ]]; then
    if [ -a src/main/docker/elasticsearch.yml ]; then
        docker-compose -f src/main/docker/elasticsearch.yml up -d
    fi
    if [ -a src/main/docker/postgresql.yml ]; then
        docker-compose -f src/main/docker/postgresql.yml up -d
    fi

elif [[ ("$JHIPSTER" == 'app-mariadb-kafka') ]]; then
    if [ -a src/main/docker/kafka.yml ]; then
      docker-compose -f src/main/docker/kafka.yml up -d
    fi
    if [ -a src/main/docker/mariadb.yml ]; then
      docker-compose -f src/main/docker/mariadb.yml up -d
    fi

elif [[ ("$JHIPSTER" == 'app-ng2-gateway-eureka') || ("$JHIPSTER" == 'app-microservice-eureka') ]]; then
    if [ -a src/main/docker/jhipster-registry.yml ]; then
        docker-compose -f src/main/docker/jhipster-registry.yml up -d
    fi

elif [[ ("$JHIPSTER" == 'app-ng2-gateway-consul') || ("$JHIPSTER" == 'app-microservice-consul') ]]; then
    if [ -a src/main/docker/consul.yml ]; then
        docker-compose -f src/main/docker/consul.yml up -d
    fi

elif [[ "$JHIPSTER" == 'app-ng2-gateway-uaa' ]]; then
    if [ -a src/main/docker/jhipster-registry.yml ]; then
        docker-compose -f src/main/docker/jhipster-registry.yml up -d
    fi
fi

docker ps -a

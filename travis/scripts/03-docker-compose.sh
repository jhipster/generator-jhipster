#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd "$HOME"/"$JHIPSTER"
if [[ ("$JHIPSTER" == 'app-cassandra') && (-a src/main/docker/cassandra.yml) ]]; then
  # travis is not stable with docker... need to start container with privileged
  echo '        privileged: true' >> src/main/docker/cassandra.yml
  docker-compose -f src/main/docker/cassandra.yml build
  docker-compose -f src/main/docker/cassandra.yml up -d
elif [[ ("$JHIPSTER" == 'app-mongodb') && (-a src/main/docker/mongodb.yml) ]]; then
  docker-compose -f src/main/docker/mongodb.yml up -d
elif [[ ("$JHIPSTER" == 'app-mysql') && (-a src/main/docker/mysql.yml) ]]; then
  docker-compose -f src/main/docker/mysql.yml up -d
elif [[ ("$JHIPSTER" == 'app-psql-es-noi18n') ]]; then
  if [ -a src/main/docker/elasticsearch.yml ]; then
    docker-compose -f src/main/docker/elasticsearch.yml up -d
  fi
  if [ -a src/main/docker/postgresql.yml ]; then
    docker-compose -f src/main/docker/postgresql.yml up -d
  fi
elif [[ ("$JHIPSTER" == 'app-gateway') || ("$JHIPSTER" == 'app-microservice') ]]; then
  if [ -a src/main/docker/jhipster-registry.yml ]; then
    docker-compose -f src/main/docker/jhipster-registry.yml up -d
    sleep 15
  fi
fi
docker ps -a

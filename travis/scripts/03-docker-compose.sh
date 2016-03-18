#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd "$HOME"/"$JHIPSTER"
if [[ ("$JHIPSTER" == 'app-cassandra') && (-a src/main/docker/app.yml) ]]; then
  # travis is not stable with docker... need to start container with privileged
  echo '        privileged: true' >> src/main/docker/app.yml
  docker-compose -f src/main/docker/app.yml build
  docker-compose -f src/main/docker/app.yml up -d
elif [[ ("$JHIPSTER" == 'app-mongodb') && (-a src/main/docker/app.yml) ]]; then
  docker-compose -f src/main/docker/app.yml up -d
elif [[ ("$JHIPSTER" == 'app-mysql') || ("$JHIPSTER" == 'app-psql-es-noi18n') ]]; then
  if [ -a src/main/docker/app.yml ]; then
    docker-compose -f src/main/docker/app.yml up -d
  fi
elif [[ ("$JHIPSTER" == 'app-gateway') || ("$JHIPSTER" == 'app-microservice') ]]; then
  if [ -a src/main/docker/jhipster-registry.yml ]; then
    docker-compose -f src/main/docker/jhipster-registry.yml up -d
    sleep 15
  fi
fi
docker ps -a

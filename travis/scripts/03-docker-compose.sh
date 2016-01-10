#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd $HOME/$JHIPSTER
if [[ ($JHIPSTER == 'app-cassandra') && (-a src/main/docker/dev.yml) ]]; then
  # travis is not stable with docker... need to start container with privileged
  echo '  privileged: true' >> src/main/docker/dev.yml
  docker-compose -f src/main/docker/dev.yml build
  docker-compose -f src/main/docker/dev.yml up -d
elif [[ ($JHIPSTER == 'app-mongodb') && (-a src/main/docker/dev.yml) ]]; then
  docker-compose -f src/main/docker/dev.yml up -d
elif [[ ($JHIPSTER == 'app-mysql') || ($JHIPSTER == 'app-psql-es') ]]; then
  if [ -a src/main/docker/prod.yml ]; then
    docker-compose -f src/main/docker/prod.yml up -d
  fi
fi
docker ps -a

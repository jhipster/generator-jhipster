#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------
cd $HOME/$JHIPSTER
if [[ ($JHIPSTER == 'app-cassandra') && (-a docker-compose.yml) ]]; then
  # travis is not stable with docker... need to start container with privileged
  echo '  privileged: true' >> docker-compose.yml
  docker-compose build
  docker-compose up -d
  sleep 20
  docker exec -it samplecassandra-dev-cassandra init
elif [[ ($JHIPSTER == 'app-mongodb') && (-a docker-compose.yml) ]]; then
  docker-compose up -d
  sleep 20
elif [[ ($JHIPSTER == 'app-mysql') || ($JHIPSTER == 'app-psql-es') ]]; then
  if [ -a docker-compose-prod.yml ]; then
    docker-compose -f docker-compose-prod.yml up -d
    sleep 20
  fi
fi
docker ps -a

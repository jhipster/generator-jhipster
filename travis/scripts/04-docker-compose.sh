#!/bin/bash
set -ev
#--------------------------------------------------
# Start docker container
#--------------------------------------------------
cd $JHIPSTER_SAMPLES/$JHIPSTER
if [ -a docker-compose-prod.yml ]; then
  # travis is not stable with docker... need to start container with privileged
  echo '  privileged: true' >> docker-compose-prod.yml
  docker-compose -f docker-compose-prod.yml up -d
  sleep 20
  if [ $JHIPSTER == "app-cassandra" ]; then
    docker exec -it sampleCassandra-prod-cassandra init
  fi
  docker ps -a
fi

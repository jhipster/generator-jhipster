#!/bin/bash
set -ev
#--------------------------------------------------
# Start docker container
#--------------------------------------------------
cd $HOME/$JHIPSTER
if [ -a docker-compose-prod.yml ]; then
  # travis is not stable with docker... need to start container with privileged
  echo '  privileged: true' >> docker-compose-prod.yml
  docker-compose -f docker-compose-prod.yml up -d
  if [ $JHIPSTER == "app-cassandra" ]; then
    sleep 30
    docker exec -it samplecassandra-prod-cassandra init
  else
    sleep 20
  fi
  docker ps -a
fi

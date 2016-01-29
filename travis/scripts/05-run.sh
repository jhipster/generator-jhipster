#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Start the application
#-------------------------------------------------------------------------------
cd $HOME/$JHIPSTER
if [ $RUN_APP == 1 ]; then
  if [ $JHIPSTER != "app-gradle" ]; then
    if [ $JHIPSTER == 'app-cassandra' ]; then
      chmod -R 777 src/main/resources/config/cql/
      docker cp src/main/resources/config/cql/ samplecassandra-dev-cassandra:/
      docker exec -it samplecassandra-dev-cassandra init
    fi
    mvn package -DskipTests=true -P$PROFILE
    mv target/*.war target/app.war
    java -jar target/app.war --spring.profiles.active=$PROFILE &
  else
    ./gradlew bootRepackage -P$PROFILE -x test
    mv build/libs/*.war build/libs/app.war
    java -jar build/libs/app.war --spring.profiles.active=$PROFILE &
  fi
  sleep 40
  #-------------------------------------------------------------------------------
  # Launch protractor tests
  #-------------------------------------------------------------------------------
  if [ $PROTRACTOR == 1 ]; then
    grunt itest
  fi
fi

#!/bin/bash
set -ev
#--------------------------------------------------
# Launch tests
#--------------------------------------------------
cd "$HOME"/"$JHIPSTER"
if [ "$JHIPSTER" != "app-gradle" ]; then
  MYSQL_HOST=$(docker inspect --format '{{.NetworkSettings.Networks.docker_default.IPAddress}}' tmp-mysql)
  mvn test --spring.datasource.url=jdbc:mysql://${MYSQL_HOST}:3306/tmp?useUnicode=true&characterEncoding=utf8&useSSL=false
else
  ./gradlew test
fi
if [ "$JHIPSTER" != "app-microservice" ]; then
  gulp test --no-notification
fi

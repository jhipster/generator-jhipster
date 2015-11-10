#!/bin/bash
set -ev
#--------------------------------------------------
# Check all versions
#--------------------------------------------------
java -version
git --version
mvn -v
node -v
npm -v
bower -v
yo --version
grunt --version
gulp -v
docker version
docker-compose version

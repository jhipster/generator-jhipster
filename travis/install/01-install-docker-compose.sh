#!/bin/bash
set -ev
#--------------------------------------------------
# Install docker-compose
#--------------------------------------------------
curl -L https://github.com/docker/compose/releases/download/1.4.2/docker-compose-`uname -s`-`uname -m` > docker-compose
sudo mv docker-compose /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

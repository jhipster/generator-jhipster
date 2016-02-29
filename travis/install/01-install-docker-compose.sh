#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Upgrade Docker
#-------------------------------------------------------------------------------


#-------------------------------------------------------------------------------
# Install docker-compose
#-------------------------------------------------------------------------------
curl -L https://github.com/docker/compose/releases/download/1.6.2/docker-compose-"$(uname -s)"-"$(uname -m)" > docker-compose
sudo mv docker-compose /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

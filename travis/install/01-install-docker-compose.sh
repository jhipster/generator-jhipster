#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Upgrade Docker
#-------------------------------------------------------------------------------
apt-cache madison docker-engine
sudo apt-get -o Dpkg::Options::="--force-confnew" install -y docker-engine=1.12.0-0~trusty

#-------------------------------------------------------------------------------
# Install docker-compose
#-------------------------------------------------------------------------------
curl -L https://github.com/docker/compose/releases/download/1.8.0/docker-compose-"$(uname -s)"-"$(uname -m)" > docker-compose
sudo mv docker-compose /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

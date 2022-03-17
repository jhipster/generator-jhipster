#!/usr/bin/env bash

sudo /etc/init.d/mysql stop

echo "127.0.0.1 keycloak\n127.0.0.1 kafka" | sudo tee -a /etc/hosts

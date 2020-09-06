#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

git config --global user.name "JHipster Bot"
git config --global user.email "jhipster-bot@jhipster.tech"

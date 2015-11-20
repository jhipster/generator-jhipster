#!/bin/bash
set -ev
#--------------------------------------------------
# Install yeoman, bower, grunt and gulp
#--------------------------------------------------
npm install -g yo
npm install -g bower
npm install -g grunt-cli
npm install -g gulp
#--------------------------------------------------
# Install the latest version of JHipster
#--------------------------------------------------
cd $TRAVIS_BUILD_DIR/
npm install
npm link
npm test

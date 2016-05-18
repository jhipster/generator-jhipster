#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Update npm
#-------------------------------------------------------------------------------
npm install -g npm
#-------------------------------------------------------------------------------
# Install yeoman, bower and gulp
#-------------------------------------------------------------------------------
# setting yeoman version as temp workaround for yeoman issue https://github.com/yeoman/yo/issues/437
npm install -g yo@1.8.1
npm install -g bower
npm install -g gulp-cli
#-------------------------------------------------------------------------------
# Install the latest version of JHipster
#-------------------------------------------------------------------------------
cd "$TRAVIS_BUILD_DIR"/
npm install
npm link
npm test

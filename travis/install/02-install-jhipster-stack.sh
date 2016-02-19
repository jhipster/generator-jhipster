#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Install yeoman, bower and gulp
#-------------------------------------------------------------------------------
npm install -g yo
npm install -g bower
npm install -g gulp-cli
#-------------------------------------------------------------------------------
# Install the latest version of JHipster
#-------------------------------------------------------------------------------
cd $TRAVIS_BUILD_DIR/
npm install
npm link
npm test

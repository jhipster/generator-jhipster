#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Use jhipster-travis-build that contain .m2 and node_modules
#-------------------------------------------------------------------------------
cd $TRAVIS_BUILD_DIR/
git clone https://github.com/jhipster/jhipster-travis-build.git
if [ $JHIPSTER != 'app-gradle' ]; then
  rm -Rf $HOME/.m2/repository/
  mv $TRAVIS_BUILD_DIR/jhipster-travis-build/repository $HOME/.m2/
  ls -al $HOME/.m2/
  ls -al $HOME/.m2/repository/
fi
if [ $JHIPSTER_NODE_CACHE == 1 ]; then
  mv $TRAVIS_BUILD_DIR/jhipster-travis-build/node_modules/ $JHIPSTER_SAMPLES/$JHIPSTER/
  ls -al $JHIPSTER_SAMPLES/$JHIPSTER/
fi

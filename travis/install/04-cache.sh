#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Use jhipster-travis-build that contain .m2 and node_modules
#-------------------------------------------------------------------------------
cd "$TRAVIS_BUILD_DIR"/
git clone https://github.com/jhipster/jhipster-travis-build.git
if [ "$JHIPSTER" != 'app-gradle' ]; then
  rm -Rf "$HOME"/.m2/repository/
  mv "$TRAVIS_BUILD_DIR"/jhipster-travis-build/repository "$HOME"/.m2/
  ls -al "$HOME"/.m2/
  ls -al "$HOME"/.m2/repository/
fi
if [ "$JHIPSTER_NODE_CACHE" == 1 ]; then
  mv "$TRAVIS_BUILD_DIR"/jhipster-travis-build/node_modules/ "$JHIPSTER_SAMPLES/$JHIPSTER"/
  ls -al "$JHIPSTER_SAMPLES"/"$JHIPSTER"/
fi
#-------------------------------------------------------------------------------
# Use phantomjs cache
#-------------------------------------------------------------------------------
tar -xvf "$TRAVIS_BUILD_DIR"/jhipster-travis-build/phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C "$TRAVIS_BUILD_DIR"/jhipster-travis-build/
sudo mkdir -p /usr/local/phantomjs-2.1.1/
sudo mv "$TRAVIS_BUILD_DIR"/jhipster-travis-build/phantomjs-2.1.1-linux-x86_64/LICENSE.BSD /usr/local/phantomjs-2.1.1/
sudo mv "$TRAVIS_BUILD_DIR"/jhipster-travis-build/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/phantomjs-2.1.1/
sudo rm /usr/local/phantomjs
sudo ln -sf /usr/local/phantomjs-2.1.1/ /usr/local/phantomjs
ls -l /usr/local/
ls -l /usr/local/phantomjs/
ls -l /usr/local/phantomjs-2.1.1/

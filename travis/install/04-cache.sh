#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Use jhipster-travis-cache that contain .m2 and node_modules
#-------------------------------------------------------------------------------
cd "$TRAVIS_BUILD_DIR"/
git clone -b $JHIPSTER_CACHE_BRANCH $JHIPSTER_CACHE_REPO

rm -Rf "$HOME"/.m2/repository/
mv "$TRAVIS_BUILD_DIR"/jhipster-travis-cache/repository "$HOME"/.m2/

#-------------------------------------------------------------------------------
# Use phantomjs cache
#-------------------------------------------------------------------------------
tar -xvf "$TRAVIS_BUILD_DIR"/jhipster-travis-cache/phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C "$TRAVIS_BUILD_DIR"/jhipster-travis-cache/
sudo mkdir -p /usr/local/phantomjs-2.1.1/
sudo mv "$TRAVIS_BUILD_DIR"/jhipster-travis-cache/phantomjs-2.1.1-linux-x86_64/LICENSE.BSD /usr/local/phantomjs-2.1.1/
sudo mv "$TRAVIS_BUILD_DIR"/jhipster-travis-cache/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/phantomjs-2.1.1/
sudo rm /usr/local/phantomjs
sudo ln -sf /usr/local/phantomjs-2.1.1/ /usr/local/phantomjs
ls -l /usr/local/
ls -l /usr/local/phantomjs/
ls -l /usr/local/phantomjs-2.1.1/

#!/bin/bash
set -ev
#--------------------------------------------------
# Generate the project with yo jhipster
#--------------------------------------------------
mv -f $JHIPSTER_SAMPLES/$JHIPSTER $HOME/
cd $HOME/$JHIPSTER
npm link generator-jhipster
yo jhipster --force --no-insight
ls -al $HOME/$JHIPSTER
ls -al $HOME/$JHIPSTER/node_modules/generator-jhipster/
ls -al $HOME/$JHIPSTER/node_modules/generator-jhipster/entity/

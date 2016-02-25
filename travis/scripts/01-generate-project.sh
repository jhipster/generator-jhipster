#!/bin/bash
set -ev
#-------------------------------------------------------------------------------
# Generate the project with yo jhipster
#-------------------------------------------------------------------------------
mv -f "$JHIPSTER_SAMPLES"/"$JHIPSTER" "$HOME"/
cd "$HOME"/"$JHIPSTER"

rm -Rf "$HOME"/"$JHIPSTER"/node_modules/.bin/*grunt*
rm -Rf "$HOME"/"$JHIPSTER"/node_modules/*grunt*
rm -Rf "$HOME"/"$JHIPSTER"/node_modules/*phantom*

rm -Rf "$HOME"/"$JHIPSTER"/src
rm -Rf "$HOME"/"$JHIPSTER"/target

npm link generator-jhipster
yo jhipster --force --no-insight
ls -al "$HOME"/"$JHIPSTER"
ls -al "$HOME"/"$JHIPSTER"/node_modules/
ls -al "$HOME"/"$JHIPSTER"/node_modules/generator-jhipster/
ls -al "$HOME"/"$JHIPSTER"/node_modules/generator-jhipster/generators/
ls -al "$HOME"/"$JHIPSTER"/node_modules/generator-jhipster/generators/entity/

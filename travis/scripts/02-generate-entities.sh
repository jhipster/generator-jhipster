#!/bin/bash
set -ev
#--------------------------------------------------
# Generate the entities with yo jhipster:entity
#--------------------------------------------------
cd $JHIPSTER_SAMPLES/$JHIPSTER
if [ -a .jhipster/BankAccount.json ]; then
  yo jhipster:entity BankAccount --force --no-insight
fi
if [ -a .jhipster/Label.json ]; then
  yo jhipster:entity Label --force --no-insight
fi
if [ -a .jhipster/Operation.json ]; then
  yo jhipster:entity Operation --force --no-insight
fi

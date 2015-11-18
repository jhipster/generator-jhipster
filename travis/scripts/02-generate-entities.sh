#!/bin/bash
set -ev
#--------------------------------------------------
# Generate the entities with yo jhipster:entity
#--------------------------------------------------
cd $HOME/$JHIPSTER
if [ -a .jhipster/BankAccount.json ]; then
  yo jhipster:entity BankAccount --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_BankAccount.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/Label.json ]; then
  yo jhipster:entity Label --force --no-insight
fi
if [ -a .jhipster/Operation.json ]; then
  yo jhipster:entity Operation --force --no-insight
fi

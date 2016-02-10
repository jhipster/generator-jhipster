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

if [ -a .jhipster/FieldTestEntity.json ]; then
  yo jhipster:entity FieldTestEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestMapstructEntity.json ]; then
  yo jhipster:entity FieldTestMapstructEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestMapstructEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestServiceClassEntity.json ]; then
  yo jhipster:entity FieldTestServiceClassEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestServiceClassEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestServiceImplEntity.json ]; then
  yo jhipster:entity FieldTestServiceImplEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestServiceImplEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestInfiniteScrollEntity.json ]; then
  yo jhipster:entity FieldTestInfiniteScrollEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestInfiniteScrollEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestPagerEntity.json ]; then
  yo jhipster:entity FieldTestPagerEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestPagerEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi
if [ -a .jhipster/FieldTestPaginationEntity.json ]; then
  yo jhipster:entity FieldTestPaginationEntity --force --no-insight
  if [ $JHIPSTER == "app-cassandra" ]; then
    cat src/main/resources/config/cql/*_added_entity_FieldTestPaginationEntity.cql >> src/main/resources/config/cql/create-tables.cql
  fi
fi


if [ -a .jhipster/RelationshipTestEntity.json ]; then
  yo jhipster:entity RelationshipTestEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestMapstructEntity.json ]; then
  yo jhipster:entity RelationshipTestMapstructEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestServiceClassEntity.json ]; then
  yo jhipster:entity RelationshipTestServiceClassEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestServiceImplEntity.json ]; then
  yo jhipster:entity RelationshipTestServiceImplEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestInfiniteScrollEntity.json ]; then
  yo jhipster:entity RelationshipTestInfiniteScrollEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestPagerEntity.json ]; then
  yo jhipster:entity RelationshipTestPagerEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestPaginationEntity.json ]; then
  yo jhipster:entity RelationshipTestPaginationEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestManyToOneEntity.json ]; then
  yo jhipster:entity RelationshipTestManyToOneEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestManyToManyEntity.json ]; then
  yo jhipster:entity RelationshipTestManyToManyEntity --force --no-insight
fi
if [ -a .jhipster/RelationshipTestOneToOneEntity.json ]; then
  yo jhipster:entity RelationshipTestOneToOneEntity --force --no-insight
fi

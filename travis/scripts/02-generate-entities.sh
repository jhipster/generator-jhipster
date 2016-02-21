#!/bin/bash
set -ev

moveEntity() {
  local entity="$1"
  mv $JHIPSTER_SAMPLES/.jhipster/"$entity".json $HOME/$JHIPSTER/.jhipster/
}

generateEntity() {
  local entity="$1"
  if [ -a .jhipster/"$entity".json ]; then
    yo jhipster:entity "$entity" --force --no-insight
    if [ "$JHIPSTER" == "app-cassandra" ]; then
      cat src/main/resources/config/cql/*_added_entity_"$entity".cql >> src/main/resources/config/cql/create-tables.cql
    fi
  fi
}

#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------
mkdir -p $HOME/$JHIPSTER/.jhipster/
if [ "$JHIPSTER" == "app-mongodb" ]; then
  moveEntity BankAccountMongo
  moveEntity Field*
elif [ "$JHIPSTER" == "app-cassandra" ]; then
  moveEntity BankAccountCassandra
  moveEntity FieldTestEntity
  moveEntity FieldTestMapstructEntity
  moveEntity FieldTestServiceClassEntity
  moveEntity FieldTestServiceImplEntity
elif [ "$JHIPSTER" == "app-mysql" || "$JHIPSTER" == "app-psql-es-noi18n" ]; then
  moveEntity BankAccount
  moveEntity Label
  moveEntity Operation
  moveEntity Field*
  moveEntity Test*
else
  moveEntity BankAccount
  moveEntity Label
  moveEntity Operation
  moveEntity Field*
fi

#-------------------------------------------------------------------------------
# Generate the entities with yo jhipster:entity
#-------------------------------------------------------------------------------
cd $HOME/$JHIPSTER
generateEntity BankAccount
generateEntity Label
generateEntity Operation

generateEntity FieldTestEntity
generateEntity FieldTestMapstructEntity
generateEntity FieldTestServiceClassEntity
generateEntity FieldTestServiceImplEntity
generateEntity FieldTestInfiniteScrollEntity
generateEntity FieldTestPagerEntity
generateEntity FieldTestPaginationEntity

generateEntity TestEntity
generateEntity TestMapstructEntity
generateEntity TestServiceClassEntity
generateEntity TestServiceImplEntity
generateEntity TestInfiniteScrollEntity
generateEntity TestPagerEntity
generateEntity TestPaginationEntity
generateEntity TestManyToOneEntity
generateEntity TestManyToManyEntity
generateEntity TestOneToOneEntity

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
if [ $JHIPSTER != "app-gradle" ]; then
  mvn javadoc:javadoc
else
  ./gradlew javadoc
fi

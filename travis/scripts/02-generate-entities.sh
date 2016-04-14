#!/bin/bash
set -ev

moveEntity() {
  local entity="$1"
  mv "$JHIPSTER_SAMPLES"/.jhipster/"$entity".json "$HOME"/"$JHIPSTER"/.jhipster/
}

generateEntity() {
  local entity="$1"
  if [ -a .jhipster/"$entity".json ]; then
    yo jhipster:entity "$entity" --force --no-insight
  fi
}

#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------
mkdir -p "$HOME"/"$JHIPSTER"/.jhipster/
if [ "$JHIPSTER" == "app-mongodb" ]; then
  moveEntity MongoBankAccount

  moveEntity FieldTestEntity
  moveEntity FieldTestMapstructEntity
  moveEntity FieldTestServiceClassEntity
  moveEntity FieldTestServiceImplEntity
  moveEntity FieldTestInfiniteScrollEntity
  moveEntity FieldTestPagerEntity
  moveEntity FieldTestPaginationEntity

elif [ "$JHIPSTER" == "app-cassandra" ]; then
  moveEntity CassBankAccount

  moveEntity CassTestEntity
  moveEntity CassTestMapstructEntity
  moveEntity CassTestServiceClassEntity
  moveEntity CassTestServiceImplEntity

elif [ "$JHIPSTER" == "app-microservice" ]; then
  moveEntity MicroserviceBankAccount
  moveEntity MicroserviceOperation
  moveEntity MicroserviceLabel

  moveEntity FieldTestEntity
  moveEntity FieldTestMapstructEntity
  moveEntity FieldTestServiceClassEntity
  moveEntity FieldTestServiceImplEntity
  moveEntity FieldTestInfiniteScrollEntity
  moveEntity FieldTestPagerEntity
  moveEntity FieldTestPaginationEntity

elif [[ ("$JHIPSTER" == "app-mysql") || ("$JHIPSTER" == "app-psql-es-noi18n") ]]; then
  moveEntity BankAccount
  moveEntity Label
  moveEntity Operation

  moveEntity FieldTestEntity
  moveEntity FieldTestMapstructEntity
  moveEntity FieldTestServiceClassEntity
  moveEntity FieldTestServiceImplEntity
  moveEntity FieldTestInfiniteScrollEntity
  moveEntity FieldTestPagerEntity
  moveEntity FieldTestPaginationEntity

  moveEntity TestEntity
  moveEntity TestMapstruct
  moveEntity TestServiceClass
  moveEntity TestServiceImpl
  moveEntity TestInfiniteScroll
  moveEntity TestPager
  moveEntity TestPagination
  moveEntity TestManyToOne
  moveEntity TestManyToMany
  moveEntity TestOneToOne

else
  moveEntity BankAccount
  moveEntity Label
  moveEntity Operation

  moveEntity FieldTestEntity
  moveEntity FieldTestMapstructEntity
  moveEntity FieldTestServiceClassEntity
  moveEntity FieldTestServiceImplEntity
  moveEntity FieldTestInfiniteScrollEntity
  moveEntity FieldTestPagerEntity
  moveEntity FieldTestPaginationEntity
fi

ls -l "$HOME"/"$JHIPSTER"/.jhipster/

#-------------------------------------------------------------------------------
# Generate the entities with yo jhipster:entity
#-------------------------------------------------------------------------------
cd "$HOME"/"$JHIPSTER"
generateEntity BankAccount
generateEntity MongoBankAccount
generateEntity MicroserviceBankAccount
generateEntity CassBankAccount
generateEntity Label
generateEntity MicroserviceLabel
generateEntity Operation
generateEntity MicroserviceOperation

generateEntity CassTestEntity
generateEntity CassTestMapstructEntity
generateEntity CassTestServiceClassEntity
generateEntity CassTestServiceImplEntity

generateEntity FieldTestEntity
generateEntity FieldTestMapstructEntity
generateEntity FieldTestServiceClassEntity
generateEntity FieldTestServiceImplEntity
generateEntity FieldTestInfiniteScrollEntity
generateEntity FieldTestPagerEntity
generateEntity FieldTestPaginationEntity

generateEntity TestEntity
generateEntity TestMapstruct
generateEntity TestServiceClass
generateEntity TestServiceImpl
generateEntity TestInfiniteScroll
generateEntity TestPager
generateEntity TestPagination
generateEntity TestManyToOne
generateEntity TestManyToMany
generateEntity TestOneToOne

#-------------------------------------------------------------------------------
# Check Javadoc generation
#-------------------------------------------------------------------------------
if [ "$JHIPSTER" != "app-gradle" ]; then
  mvn javadoc:javadoc
else
  ./gradlew javadoc
fi

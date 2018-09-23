#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
moveEntity() {
    local entity="$1"
    cp "$JH_SAMPLES"/.jhipster/"$entity".json "$JH_FOLDER_APP"/.jhipster/
}

#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------

rm -Rf "$JH_FOLDER_APP"
mkdir -p "$JH_FOLDER_APP"/.jhipster/

if [[ ("$JH_APP" == *"mongodb"*) || ("$JH_APP" == *"couchbase"*) ]]; then
    moveEntity DocumentBankAccount

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPagerEntity
    moveEntity FieldTestPaginationEntity

elif [[ "$JH_APP" == *"cassandra"* ]]; then
    moveEntity CassBankAccount

    moveEntity CassTestEntity
    moveEntity CassTestMapstructEntity
    moveEntity CassTestServiceClassEntity
    moveEntity CassTestServiceImplEntity

elif [[ "$JH_APP" == *"micro"* ]]; then
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

elif [[ "$JH_APP" == *"react"* ]]; then
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

    moveEntity EntityWithDTO
    moveEntity EntityWithPagination
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClass
    moveEntity EntityWithServiceClassAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
    moveEntity EntityWithServiceImpl
    moveEntity EntityWithServiceImplAndDTO
    moveEntity EntityWithServiceImplAndPagination
    moveEntity EntityWithServiceImplPaginationAndDTO

elif [[ "$JH_APP" == *"uaa"* ]]; then
    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPagerEntity
    moveEntity FieldTestPaginationEntity

elif [[ ( "$JH_APP" == *"mysql"* ) || ( "$JH_APP" == *"psql"* ) ]]; then
    moveEntity BankAccount
    moveEntity Label
    moveEntity Operation
    moveEntity Place
    moveEntity Division

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
    moveEntity TestManyRelPaginDTO
    moveEntity TestOneToOne
    moveEntity TestCustomTableName
    moveEntity TestTwoRelationshipsSameEntity

    moveEntity EntityWithDTO
    moveEntity EntityWithPagination
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClass
    moveEntity EntityWithServiceClassAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
    moveEntity EntityWithServiceImpl
    moveEntity EntityWithServiceImplAndDTO
    moveEntity EntityWithServiceImplAndPagination
    moveEntity EntityWithServiceImplPaginationAndDTO
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

    moveEntity EntityWithDTO
    moveEntity EntityWithPagination
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClass
    moveEntity EntityWithServiceClassAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
    moveEntity EntityWithServiceImpl
    moveEntity EntityWithServiceImplAndDTO
    moveEntity EntityWithServiceImplAndPagination
    moveEntity EntityWithServiceImplPaginationAndDTO
fi

ls -l "$JH_FOLDER_APP"/.jhipster/

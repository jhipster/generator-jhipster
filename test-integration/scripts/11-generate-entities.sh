#!/bin/bash

set -e
if [[ -a $(dirname $0)/00-init-env.sh ]]; then
    source $(dirname $0)/00-init-env.sh
else
    echo "*** 00-init-env.sh not found"
fi

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
moveEntity() {
    local entity="$1"
    cp "$JHI_SAMPLES"/.jhipster/"$entity".json "$JHI_FOLDER_APP"/.jhipster/
}

prepareFolder() {
    rm -rf "$JHI_FOLDER_APP"
    mkdir -p "$JHI_FOLDER_APP"/.jhipster/
}
#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------

if [[ $JHI_REPO != "" ]]; then
    prepareFolder
fi

if [[ ("$JHI_ENTITY" == "mongodb") || ("$JHI_ENTITY" == "couchbase") ]]; then
    moveEntity DocumentBankAccount

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity

elif [[ "$JHI_ENTITY" == "cassandra" ]]; then
    moveEntity CassBankAccount

    moveEntity CassTestEntity
    moveEntity CassTestMapstructEntity
    moveEntity CassTestServiceClassEntity
    moveEntity CassTestServiceImplEntity

elif [[ "$JHI_ENTITY" == "micro" ]]; then
    moveEntity MicroserviceBankAccount
    moveEntity MicroserviceOperation
    moveEntity MicroserviceLabel

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity

elif [[ "$JHI_ENTITY" == "uaa" ]]; then
    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity

elif [[ "$JHI_ENTITY" == "sqllight" ]]; then
    moveEntity BankAccount
    moveEntity Label
    moveEntity Operation

elif [[ "$JHI_ENTITY" == "sqlfull" ]]; then
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
    moveEntity FieldTestPaginationEntity

    moveEntity TestEntity
    moveEntity TestMapstruct
    moveEntity TestServiceClass
    moveEntity TestServiceImpl
    moveEntity TestInfiniteScroll
    moveEntity TestPagination
    moveEntity TestManyToOne
    moveEntity TestManyToMany
    moveEntity TestManyRelPaginDTO
    moveEntity TestOneToOne
    moveEntity TestCustomTableName
    moveEntity TestTwoRelationshipsSameEntity
    moveEntity SuperMegaLargeTestEntity

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

    moveEntity MapsIdParentEntityWithoutDTO
    moveEntity MapsIdChildEntityWithoutDTO
    moveEntity MapsIdParentEntityWithDTO
    moveEntity MapsIdChildEntityWithDTO
    moveEntity MapsIdUserProfileWithDTO

elif [[ "$JHI_ENTITY" == "sql" ]]; then
    moveEntity BankAccount
    moveEntity Label
    moveEntity Operation

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructEntity
    moveEntity FieldTestServiceClassEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
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

    moveEntity MapsIdUserProfileWithDTO

fi

#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------
echo "*** Entities:"
ls -al "$JHI_FOLDER_APP"/.jhipster/

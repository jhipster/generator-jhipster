#!/usr/bin/env bash

set -e
if [[ -a $(dirname $0)/00-init-env.sh ]]; then
    source $(dirname $0)/00-init-env.sh
else
    echo "*** 00-init-env.sh not found"
fi

echo "11-generate-entities.sh script is deprecated, use 11-generate-config.sh instead"
if [[ "$JHI_GENERATE_SKIP_CONFIG" == "1" ]]; then
    exit 1
fi

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------
moveEntity() {
    local entity="$1"
    cp "$JHI_SAMPLES"/.jhipster/"$entity".json "$JHI_FOLDER_APP"/.jhipster/
}

prepareFolder() {
    if [[$(dirname $(pwd)) != $(dirname $JHI_FOLDER_APP)]]; then
      rm -rf "$JHI_FOLDER_APP"
    fi
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
    moveEntity EmbeddedOperation
    moveEntity Place
    moveEntity Division

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructAndServiceClassEntity
    moveEntity FieldTestServiceClassAndJpaFilteringEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity

    moveEntity EntityWithDTO
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
    moveEntity EntityWithServiceImplAndDTO
    moveEntity EntityWithServiceImplAndPagination
    moveEntity EntityWithServiceImplPaginationAndDTO

elif [[ "$JHI_ENTITY" == "neo4j" ]]; then
    moveEntity Album
    moveEntity Track
    moveEntity Genre
    moveEntity Artist

elif [[ "$JHI_ENTITY" == "cassandra" ]]; then
    moveEntity CassBankAccount

    moveEntity FieldTestEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestMapstructAndServiceClassEntity
    moveEntity FieldTestPaginationEntity

elif [[ "$JHI_ENTITY" == "micro" ]]; then
    moveEntity MicroserviceBankAccount
    moveEntity MicroserviceOperation
    moveEntity MicroserviceLabel

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructAndServiceClassEntity
    moveEntity FieldTestServiceClassAndJpaFilteringEntity
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
    moveEntity FieldTestMapstructAndServiceClassEntity
    moveEntity FieldTestServiceClassAndJpaFilteringEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity
    moveEntity FieldTestEnumWithValue

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
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
    moveEntity EntityWithServiceImplAndDTO
    moveEntity EntityWithServiceImplAndPagination
    moveEntity EntityWithServiceImplPaginationAndDTO

    moveEntity MapsIdParentEntityWithoutDTO
    moveEntity MapsIdChildEntityWithoutDTO
    moveEntity MapsIdParentEntityWithDTO
    moveEntity MapsIdChildEntityWithDTO
    moveEntity MapsIdUserProfileWithDTO

    moveEntity JpaFilteringRelationship
    moveEntity JpaFilteringOtherSide

elif [[ "$JHI_ENTITY" == "sql" ]]; then
    moveEntity BankAccount
    moveEntity Label
    moveEntity Operation

    moveEntity FieldTestEntity
    moveEntity FieldTestMapstructAndServiceClassEntity
    moveEntity FieldTestServiceClassAndJpaFilteringEntity
    moveEntity FieldTestServiceImplEntity
    moveEntity FieldTestInfiniteScrollEntity
    moveEntity FieldTestPaginationEntity
    moveEntity FieldTestEnumWithValue

    moveEntity EntityWithDTO
    moveEntity EntityWithPaginationAndDTO
    moveEntity EntityWithServiceClassAndPagination
    moveEntity EntityWithServiceClassPaginationAndDTO
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

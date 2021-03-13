#!/usr/bin/env bash

#-------------------------------------------------------------------------------
# Eg: 11-generate-config.sh ./ ngx-default sqlfull
#-------------------------------------------------------------------------------
if [[ "$1" != "" ]]; then
    JHI_FOLDER_APP=$1
fi

if [[ "$2" != "" ]]; then
    JHI_APP=$2
fi

if [[ "$3" != "" ]]; then
    JHI_ENTITY=$3
fi

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
}
#-------------------------------------------------------------------------------
# Copy entities json
#-------------------------------------------------------------------------------

if [[ $JHI_REPO != "" ]]; then
    prepareFolder
fi

mkdir -p "$JHI_FOLDER_APP"/.jhipster/
cd "$JHI_FOLDER_APP"

if [[ "$JHI_ENTITY" != "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Copy jhipster config
    #-------------------------------------------------------------------------------
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
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

elif [[ "$3" != "" ]]; then
    JHI_JDL_ENTITY=$3
fi

#-------------------------------------------------------------------------------
# Generate jdl entities
#-------------------------------------------------------------------------------
if [[ "$JHI_JDL_ENTITY" != "" && "$JHI_JDL_ENTITY" != "none" ]]; then
    jhipster --no-insight jdl "$JHI_SAMPLES"/jdl-entities/$JHI_JDL_ENTITY.jdl --json-only
fi

#-------------------------------------------------------------------------------
# Print entities json
#-------------------------------------------------------------------------------
echo "*** Entities:"
ls -al "$JHI_FOLDER_APP"/.jhipster/

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$JHI_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHI_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

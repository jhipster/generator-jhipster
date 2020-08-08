/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const pluralize = require('pluralize');

function prepareEntityForTemplates(entityWithConfig, generator) {
    const entityName = entityWithConfig.name;
    const entityNamePluralizedAndSpinalCased = _.kebabCase(pluralize(entityName));

    entityWithConfig.entityTableName = entityWithConfig.entityTableName || generator.getTableName(entityName);
    entityWithConfig.entityAngularJSSuffix = entityWithConfig.angularJSSuffix;
    if (entityWithConfig.entityAngularJSSuffix && !entityWithConfig.entityAngularJSSuffix.startsWith('-')) {
        entityWithConfig.entityAngularJSSuffix = `-${entityWithConfig.entityAngularJSSuffix}`;
    }

    entityWithConfig.useMicroserviceJson = entityWithConfig.useMicroserviceJson || entityWithConfig.microserviceName !== undefined;
    if (entityWithConfig.applicationType === 'gateway' && entityWithConfig.useMicroserviceJson) {
        if (!entityWithConfig.microserviceName) {
            throw new Error('Microservice name for the entity is not found. Entity cannot be generated!');
        }
        entityWithConfig.microserviceAppName = generator.getMicroserviceAppName(entityWithConfig.microserviceName);
        entityWithConfig.skipServer = true;
    }

    entityWithConfig.entityNameCapitalized = _.upperFirst(entityWithConfig.name);
    entityWithConfig.entityClass = entityWithConfig.entityNameCapitalized;
    entityWithConfig.entityClassPlural = pluralize(entityWithConfig.entityClass);

    // Used for i18n
    entityWithConfig.entityClassHumanized = entityWithConfig.entityClassHumanized || _.startCase(entityWithConfig.entityNameCapitalized);
    entityWithConfig.entityClassPluralHumanized =
        entityWithConfig.entityClassPluralHumanized || _.startCase(entityWithConfig.entityClassPlural);
    // Implement i18n variant ex: 'male', 'female' when applied
    entityWithConfig.entityI18nVariant = entityWithConfig.entityI18nVariant || 'default';

    entityWithConfig.entityInstance = _.lowerFirst(entityName);
    entityWithConfig.entityInstancePlural = pluralize(entityWithConfig.entityInstance);

    entityWithConfig.entityFileName = _.kebabCase(
        entityWithConfig.entityNameCapitalized + _.upperFirst(entityWithConfig.entityAngularJSSuffix)
    );
    entityWithConfig.entityFolderName = generator.getEntityFolderName(entityWithConfig.clientRootFolder, entityWithConfig.entityFileName);
    entityWithConfig.entityModelFileName = entityWithConfig.entityFolderName;
    entityWithConfig.entityParentPathAddition = generator.getEntityParentPathAddition(entityWithConfig.clientRootFolder);
    entityWithConfig.entityPluralFileName = entityNamePluralizedAndSpinalCased + entityWithConfig.entityAngularJSSuffix;
    entityWithConfig.entityServiceFileName = entityWithConfig.entityFileName;

    entityWithConfig.entityAngularName =
        entityWithConfig.entityClass + generator.upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);
    entityWithConfig.entityReactName = entityWithConfig.entityClass + generator.upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);

    entityWithConfig.entityApiUrl = entityNamePluralizedAndSpinalCased;
    entityWithConfig.entityStateName = _.kebabCase(entityWithConfig.entityAngularName);
    entityWithConfig.entityUrl = entityWithConfig.entityStateName;

    entityWithConfig.entityTranslationKey = entityWithConfig.clientRootFolder
        ? _.camelCase(`${entityWithConfig.clientRootFolder}-${entityWithConfig.entityInstance}`)
        : entityWithConfig.entityInstance;
    entityWithConfig.entityTranslationKeyMenu = _.camelCase(
        entityWithConfig.clientRootFolder
            ? `${entityWithConfig.clientRootFolder}-${entityWithConfig.entityStateName}`
            : entityWithConfig.entityStateName
    );

    entityWithConfig.reactiveRepositories =
        entityWithConfig.reactive && ['mongodb', 'cassandra', 'couchbase', 'neo4j'].includes(entityWithConfig.databaseType);

    entityWithConfig.differentTypes.push(entityWithConfig.entityClass);
    entityWithConfig.i18nToLoad.push(entityWithConfig.entityInstance);
    entityWithConfig.i18nKeyPrefix = `${entityWithConfig.angularAppName}.${entityWithConfig.entityTranslationKey}`;

    const hasUserField = entityWithConfig.relationships.some(relationship => generator.isBuiltInUserEntity(relationship.otherEntityName));
    entityWithConfig.saveUserSnapshot =
        entityWithConfig.applicationType === 'microservice' &&
        entityWithConfig.authenticationType === 'oauth2' &&
        hasUserField &&
        entityWithConfig.dto === 'no';

    entityWithConfig.primaryKeyType = generator.getPkTypeBasedOnDBAndAssociation(
        entityWithConfig.authenticationType,
        entityWithConfig.databaseType,
        entityWithConfig.relationships
    );

    entityWithConfig.fields.forEach(field => {
        const fieldType = field.fieldType;
        if (!['Instant', 'ZonedDateTime', 'Boolean'].includes(fieldType)) {
            entityWithConfig.fieldsIsReactAvField = true;
        }

        if (field.javadoc) {
            entityWithConfig.haveFieldWithJavadoc = true;
        }

        if (generator.fieldIsEnum(fieldType)) {
            entityWithConfig.i18nToLoad.push(field.enumInstance);
        }

        if (fieldType === 'ZonedDateTime') {
            entityWithConfig.fieldsContainZonedDateTime = true;
            entityWithConfig.fieldsContainDate = true;
        } else if (fieldType === 'Instant') {
            entityWithConfig.fieldsContainInstant = true;
            entityWithConfig.fieldsContainDate = true;
        } else if (fieldType === 'Duration') {
            entityWithConfig.fieldsContainDuration = true;
        } else if (fieldType === 'LocalDate') {
            entityWithConfig.fieldsContainLocalDate = true;
            entityWithConfig.fieldsContainDate = true;
        } else if (fieldType === 'BigDecimal') {
            entityWithConfig.fieldsContainBigDecimal = true;
        } else if (fieldType === 'UUID') {
            entityWithConfig.fieldsContainUUID = true;
        } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
            entityWithConfig.blobFields.push(field);
            entityWithConfig.fieldsContainBlob = true;
            if (field.fieldTypeBlobContent === 'image') {
                entityWithConfig.fieldsContainImageBlob = true;
            }
            if (field.fieldTypeBlobContent !== 'text') {
                entityWithConfig.fieldsContainBlobOrImage = true;
            } else {
                entityWithConfig.fieldsContainTextBlob = true;
            }
        }

        if (Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1) {
            entityWithConfig.validation = true;
        }
    });
    return entityWithConfig;
}

module.exports = { prepareEntityForTemplates };

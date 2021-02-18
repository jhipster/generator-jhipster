/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const pluralize = require('pluralize');
const { createFaker } = require('./faker');
const { parseLiquibaseChangelogDate } = require('./liquibase');
const { entityDefaultConfig } = require('../generators/generator-defaults');
const { stringHashCode } = require('../generators/utils');

const BASE_TEMPLATE_DATA = {
  primaryKey: undefined,
  skipUiGrouping: false,
  haveFieldWithJavadoc: false,
  existingEnum: false,
  searchEngine: false,

  fieldsContainDate: false,
  fieldsContainInstant: false,
  fieldsContainUUID: false,
  fieldsContainZonedDateTime: false,
  fieldsContainDuration: false,
  fieldsContainLocalDate: false,
  fieldsContainBigDecimal: false,
  fieldsContainBlob: false,
  fieldsContainImageBlob: false,
  fieldsContainTextBlob: false,
  fieldsContainBlobOrImage: false,
  validation: false,
  fieldsContainOwnerManyToMany: false,
  fieldsContainNoOwnerOneToOne: false,
  fieldsContainOwnerOneToOne: false,
  fieldsContainOneToMany: false,
  fieldsContainManyToOne: false,
  fieldsContainEmbedded: false,
  fieldsIsReactAvField: false,

  get otherRelationships() {
    return [];
  },

  get idFields() {
    return [];
  },

  get enums() {
    return [];
  },
  // these variable hold field and relationship names for question options during update
  get fieldNameChoices() {
    return [];
  },
  get blobFields() {
    return [];
  },
  get differentTypes() {
    return [];
  },
  get differentRelationships() {
    return [];
  },
  get i18nToLoad() {
    return [];
  },
};

function prepareEntityForTemplates(entityWithConfig, generator) {
  const entityName = entityWithConfig.name;
  _.defaults(entityWithConfig, entityDefaultConfig, BASE_TEMPLATE_DATA);

  entityWithConfig.changelogDateForRecent = parseLiquibaseChangelogDate(entityWithConfig.changelogDate);
  entityWithConfig.faker = entityWithConfig.faker || createFaker(generator.jhipsterConfig.nativeLanguage);
  entityWithConfig.resetFakerSeed = (suffix = '') =>
    entityWithConfig.faker.seed(stringHashCode(entityWithConfig.name.toLowerCase() + suffix));

  entityWithConfig.entityAngularJSSuffix = entityWithConfig.angularJSSuffix;
  if (entityWithConfig.entityAngularJSSuffix && !entityWithConfig.entityAngularJSSuffix.startsWith('-')) {
    entityWithConfig.entityAngularJSSuffix = `-${entityWithConfig.entityAngularJSSuffix}`;
  }

  entityWithConfig.useMicroserviceJson = entityWithConfig.useMicroserviceJson || entityWithConfig.microserviceName !== undefined;
  if (generator.jhipsterConfig.applicationType === 'gateway' && entityWithConfig.useMicroserviceJson) {
    if (!entityWithConfig.microserviceName) {
      throw new Error('Microservice name for the entity is not found. Entity cannot be generated!');
    }
    entityWithConfig.microserviceAppName = generator.getMicroserviceAppName(entityWithConfig.microserviceName);
    entityWithConfig.skipServer = true;
  }

  _.defaults(entityWithConfig, {
    entityNameCapitalized: _.upperFirst(entityName),
    entityClass: _.upperFirst(entityName),
    entityInstance: _.lowerFirst(entityName),
    entityTableName: generator.getTableName(entityName),
    entityNamePlural: pluralize(entityName),
  });

  _.defaults(entityWithConfig, {
    entityNamePluralizedAndSpinalCased: _.kebabCase(entityWithConfig.entityNamePlural),
    entityClassPlural: _.upperFirst(entityWithConfig.entityNamePlural),
    entityInstancePlural: _.lowerFirst(entityWithConfig.entityNamePlural),
  });

  _.defaults(entityWithConfig, {
    // Implement i18n variant ex: 'male', 'female' when applied
    entityI18nVariant: 'default',
    entityClassHumanized: _.startCase(entityWithConfig.entityNameCapitalized),
    entityClassPluralHumanized: _.startCase(entityWithConfig.entityClassPlural),
  });

  entityWithConfig.entityFileName = _.kebabCase(
    entityWithConfig.entityNameCapitalized + _.upperFirst(entityWithConfig.entityAngularJSSuffix)
  );
  entityWithConfig.entityFolderName = generator.getEntityFolderName(entityWithConfig.clientRootFolder, entityWithConfig.entityFileName);
  entityWithConfig.entityModelFileName = entityWithConfig.entityFolderName;
  entityWithConfig.entityParentPathAddition = generator.getEntityParentPathAddition(entityWithConfig.clientRootFolder);
  entityWithConfig.entityPluralFileName = entityWithConfig.entityNamePluralizedAndSpinalCased + entityWithConfig.entityAngularJSSuffix;
  entityWithConfig.entityServiceFileName = entityWithConfig.entityFileName;

  entityWithConfig.entityAngularName = entityWithConfig.entityClass + generator.upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);
  entityWithConfig.entityAngularNamePlural = pluralize(entityWithConfig.entityAngularName);
  entityWithConfig.entityReactName = entityWithConfig.entityClass + generator.upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);

  entityWithConfig.entityApiUrl = entityWithConfig.entityNamePluralizedAndSpinalCased;
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

  entityWithConfig.differentTypes.push(entityWithConfig.entityClass);
  entityWithConfig.i18nToLoad.push(entityWithConfig.entityInstance);
  entityWithConfig.i18nKeyPrefix = `${entityWithConfig.frontendAppName}.${entityWithConfig.entityTranslationKey}`;
  entityWithConfig.i18nAlertHeaderPrefix = entityWithConfig.i18nKeyPrefix;
  if (entityWithConfig.microserviceAppName) {
    entityWithConfig.i18nAlertHeaderPrefix = `${entityWithConfig.microserviceAppName}.${entityWithConfig.entityTranslationKey}`;
  }

  const hasBuiltInUserField = entityWithConfig.relationships.some(relationship => generator.isBuiltInUser(relationship.otherEntityName));
  entityWithConfig.saveUserSnapshot =
    entityWithConfig.applicationType === 'microservice' &&
    entityWithConfig.authenticationType === 'oauth2' &&
    hasBuiltInUserField &&
    entityWithConfig.dto === 'no';

  if (!entityWithConfig.embedded) {
    entityWithConfig.idFields = entityWithConfig.fields.filter(field => field.id);
    entityWithConfig.idRelationships = entityWithConfig.relationships.filter(relationship => relationship.id);
    let idCount = entityWithConfig.idFields.length + entityWithConfig.idRelationships.length;

    if (idCount === 0) {
      let idField = entityWithConfig.fields.find(field => field.fieldName === 'id');
      if (idField) {
        idField.id = true;
      } else {
        idField = {
          fieldName: 'id',
          id: true,
          fieldNameHumanized: 'ID',
          fieldTranslationKey: 'global.field.id',
        };
        entityWithConfig.fields.unshift(idField);
      }
      entityWithConfig.idFields.push(idField);
      idCount++;
    }

    if (idCount > 1) {
      throw new Error('Composite id not implemented');
    } else if (entityWithConfig.idRelationships.length > 0) {
      const relationshipId = entityWithConfig.idRelationships[0];
      if (relationshipId.relationshipType === 'one-to-one' && idCount === 1) {
        relationshipId.id = true;
        entityWithConfig.derivedPrimaryKey = relationshipId;
        const idFields = entityWithConfig.idFields;
        entityWithConfig.primaryKey = {
          fieldName: 'id',
          derived: true,
          get fields() {
            return [...idFields, ...this.derivedFields];
          },
          get derivedFields() {
            return relationshipId.otherEntity.primaryKey.fields.map(field => ({
              ...field,
              derived: true,
              derivedEntity: relationshipId.otherEntity,
              jpaGeneratedValue: false,
              liquibaseAutoIncrement: false,
            }));
          },
          relationships: entityWithConfig.idRelationships,
          get name() {
            return relationshipId.otherEntity.primaryKey.name;
          },
          get nameCapitalized() {
            return relationshipId.otherEntity.primaryKey.nameCapitalized;
          },
          get type() {
            return relationshipId.otherEntity.primaryKey.type;
          },
          get tsType() {
            return relationshipId.otherEntity.primaryKey.tsType;
          },
          get references() {
            return [
              ...idFields.map(field => field.reference),
              ...relationshipId.otherEntity.primaryKey.references.map(ref => ({ ...ref })),
            ];
          },
          get composite() {
            return this.references.length > 1;
          },
        };
      } else {
        throw new Error('Composite id not implemented');
      }
    } else {
      const idField = entityWithConfig.idFields[0];
      // Allow ids type to be empty and fallback to default type for the database.
      if (!idField.fieldType) {
        idField.fieldType = generator.getPkType(entityWithConfig.databaseType);
      }
      entityWithConfig.primaryKey = {
        derived: false,
        fields: entityWithConfig.idFields,
        relationships: [],
        name: idField.fieldName,
        nameCapitalized: _.upperFirst(idField.fieldName),
        type: idField.fieldType,
        tsType: generator.getTypescriptKeyType(idField.fieldType),
        get references() {
          return entityWithConfig.idFields.map(field => field.reference);
        },
        composite: entityWithConfig.idFields.length > 1,
      };
    }
  }

  entityWithConfig.generateFakeData = type => {
    const fieldsToGenerate = type === 'cypress' ? entityWithConfig.fields.filter(field => !field.id) : entityWithConfig.fields;
    const fieldEntries = fieldsToGenerate.map(field => {
      const fieldData = field.generateFakeData(type);
      if (!field.nullable && fieldData === null) return undefined;
      return [field.fieldName, fieldData];
    });
    const withError = fieldEntries.find(entry => !entry);
    if (withError) {
      generator.warning(`Error generating a full sample for entity ${entityName}`);
      return undefined;
    }
    return Object.fromEntries(fieldEntries);
  };

  return entityWithConfig;
}

/**
 * Copy required application config into entity.
 * Some entity features are related to the backend instead of the current app.
 * This allows to entities files based on the backend features.
 *
 * @param {Object} entity - entity to copy the config into.
 * @param {Object} config - config object.
 * @returns {Object} the entity parameter for chaining.
 */
function loadRequiredConfigIntoEntity(entity, config) {
  _.defaults(entity, {
    databaseType: config.databaseType,
    prodDatabaseType: config.prodDatabaseType,
    skipUiGrouping: config.skipUiGrouping,
    searchEngine: config.searchEngine,
    jhiPrefix: config.jhiPrefix,
    authenticationType: config.authenticationType,
    reactive: config.reactive,
  });
  return entity;
}

module.exports = { prepareEntityForTemplates, loadRequiredConfigIntoEntity };

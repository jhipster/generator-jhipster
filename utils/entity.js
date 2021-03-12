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

  const dto = entityWithConfig.dto === 'mapstruct';
  if (dto) {
    _.defaults(entityWithConfig, {
      dtoClass: generator.asDto(entityWithConfig.entityClass),
      dtoInstance: generator.asDto(entityWithConfig.entityInstance),
    });
  }

  _.defaults(entityWithConfig, {
    persistClass: generator.asEntity(entityWithConfig.entityClass),
    persistInstance: generator.asEntity(entityWithConfig.entityInstance),
  });

  _.defaults(entityWithConfig, {
    restClass: dto ? entityWithConfig.dtoClass : entityWithConfig.persistClass,
    restInstance: dto ? entityWithConfig.dtoInstance : entityWithConfig.persistInstance,
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
    const idFields = entityWithConfig.fields.filter(field => field.id);
    const idRelationships = entityWithConfig.relationships.filter(relationship => relationship.id);
    let idCount = idFields.length + idRelationships.length;

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
          autoGenerate: true,
        };
        entityWithConfig.fields.unshift(idField);
      }
      idFields.push(idField);
      idCount++;
    } else if (idRelationships.length > 0) {
      idRelationships.forEach(relationship => {
        // deprecated property
        relationship.useJPADerivedIdentifier = true;
      });
    }

    if (idCount === 1 && idRelationships.length === 1) {
      const relationshipId = idRelationships[0];
      // One-To-One relationships with id uses @MapsId.
      // Almost every info is taken from the parent, except some info like autoGenerate and derived.
      // calling fieldName as otherEntityIdField.fieldName is for backward compatibility, in the future we may want to prefix it with relationship name.
      entityWithConfig._fields = entityWithConfig.fields;
      if (!relationshipId.otherEntity.primaryKey.composite) {
        Object.defineProperty(entityWithConfig, 'fields', {
          get: () => {
            if (!entityWithConfig.idField) {
              const otherEntityIdField = relationshipId.otherEntity.primaryKey.originalFields[0];
              entityWithConfig.idField = {
                fieldName: otherEntityIdField.fieldName,
                fieldType: otherEntityIdField.fieldType,
                id: true,
                autoGenerate: true,
                jpaGeneratedValue: false,
                liquibaseAutoIncrement: false,
                derived: true,
                derivedEntity: relationshipId.otherEntity,
                readonly: true,
              };
            }
            return [entityWithConfig.idField, ...entityWithConfig._fields];
          },
        });
      }
      entityWithConfig.primaryKey = {
        derived: true,
        // MapsId copy the id from the relationship.
        autoGenerate: true,
        get ids() {
          return relationshipToIds(relationshipId, generator);
        },
        get originalFields() {
          return relationshipId.otherEntity.primaryKey.originalFields;
        },
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
        get composite() {
          return relationshipId.otherEntity.primaryKey.composite;
        },
      };
    } else {
      // one field or a mix of MANY fields and relationships
      const composite = idCount > 1;
      let primaryKeyName;
      let primaryKeyType;
      if (composite) {
        primaryKeyName = 'id';
        primaryKeyType = `${entityWithConfig.entityClass}Id`;
      } else {
        const idField = idFields[0];
        // Allow ids type to be empty and fallback to default type for the database.
        if (!idField.fieldType) {
          idField.fieldType = generator.getPkType(entityWithConfig.databaseType);
        }
        primaryKeyName = idField.fieldName;
        primaryKeyType = idField.fieldType;
      }

      entityWithConfig.primaryKey = {
        derived: false,
        name: primaryKeyName,
        nameCapitalized: _.upperFirst(primaryKeyName),
        type: primaryKeyType,
        tsType: generator.getTypescriptKeyType(primaryKeyType),
        composite,
        get autoGenerate() {
          return this.composite ? false : !!this.ids[0].autoGenerate;
        },
        get ids() {
          return [
            ...idFields.map(field => fieldToId(field, generator, entityWithConfig)),
            ...idRelationships.flatMap(relationship => relationshipToIds(relationship, generator)),
          ];
        },
        get originalFields() {
          return this.ids.map(id => id.field);
        },
      };
    }
  }

  entityWithConfig.generateFakeData = type => {
    const fieldsToGenerate =
      type === 'cypress' ? entityWithConfig.fields.filter(field => !field.id || !field.autoGenerate) : entityWithConfig.fields;
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

function fieldToId(field, generator, entity) {
  const pk = {
    field,
    name: field.fieldName,
    nameDotted: field.fieldName,
    columnName: generator.getColumnName(field.fieldName),
    entity,
    usedRelationships: [],
    autoGenerate: !!field.autoGenerate,
  };
  preparePk(pk);
  return pk;
}

function relationshipToIds(relationship, generator) {
  const pks = relationship.otherEntity.primaryKey.ids.map(pk => ({
    field: pk.field,
    name: relationship.relationshipType === 'one-to-one' ? pk.name : `${relationship.relationshipName}${pk.nameCapitalized}`,
    nameDotted: `${relationship.relationshipName}.${pk.nameDotted}`,
    columnName:
      relationship.relationshipType === 'one-to-one'
        ? generator.getColumnName(pk.name)
        : `${generator.getColumnName(relationship.relationshipName)}_${pk.columnName}`,
    entity: pk.entity,
    usedRelationships: [relationship, ...pk.usedRelationships],
    autoGenerate: relationship.relationshipType === 'one-to-one',
  }));
  pks.forEach(pk => preparePk(pk));
  return pks;
}

function preparePk(pk) {
  pk.nameCapitalized = _.upperFirst(pk.name);
  pk.nameDottedAsserted = `${pk.nameDotted.replace(/\./g, '!.')}!`;
  pk.setter = `set${pk.nameCapitalized}`;
  pk.getter = (pk.field.fieldType === 'Boolean' ? 'is' : 'get') + pk.nameCapitalized;
}

module.exports = { prepareEntityForTemplates, loadRequiredConfigIntoEntity };

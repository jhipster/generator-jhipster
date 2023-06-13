/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import _ from 'lodash';
import pluralize from 'pluralize';

import { getDatabaseTypeData, hibernateSnakeCase } from '../../server/support/index.mjs';
import { createFaker, parseChangelog, stringHashCode, upperFirstCamelCase } from '../../base/support/index.mjs';
import { fieldToReference } from './prepare-field.mjs';
import { getTypescriptKeyType, getEntityParentPathAddition } from '../../client/support/index.mjs';
import {
  applicationTypes,
  authenticationTypes,
  binaryOptions,
  databaseTypes,
  entityOptions,
  fieldTypes,
  searchEngineTypes,
} from '../../../jdl/jhipster/index.mjs';
import { fieldIsEnum } from './field-utils.mjs';

import { Entity } from '../types/index.mjs';

const { sortedUniq, intersection } = _;

const NO_SEARCH_ENGINE = searchEngineTypes.NO;
const { PaginationTypes, ServiceTypes, MapperTypes } = entityOptions;
const { GATEWAY, MICROSERVICE } = applicationTypes;
const { OAUTH2 } = authenticationTypes;
const { CommonDBTypes } = fieldTypes;

const { BOOLEAN, LONG, STRING, UUID } = CommonDBTypes;
const { NO: NO_DTO, MAPSTRUCT } = MapperTypes;
const { PAGINATION, INFINITE_SCROLL } = PaginationTypes;
const { SERVICE_IMPL } = ServiceTypes;
const NO_SERVICE = ServiceTypes.NO;
const NO_PAGINATION = PaginationTypes.NO;
const NO_MAPPER = MapperTypes.NO;

const { CASSANDRA, COUCHBASE, NEO4J, SQL, MONGODB } = databaseTypes;

const { INSTANT, ZONED_DATE_TIME, DURATION, LOCAL_DATE, BIG_DECIMAL } = fieldTypes.CommonDBTypes;

const { BYTES, BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;
const { IMAGE, TEXT } = fieldTypes.BlobTypes;

const BASE_TEMPLATE_DATA = {
  primaryKey: undefined,
  entityPackage: undefined,
  skipUiGrouping: false,
  anyFieldHasDocumentation: false,
  existingEnum: false,
  searchEngine: NO_SEARCH_ENGINE,
  microserviceName: undefined,

  requiresPersistableImplementation: false,
  anyFieldIsDateDerived: false,
  anyFieldIsTimeDerived: false,
  anyFieldIsInstant: false,
  anyFieldIsUUID: false,
  anyFieldIsZonedDateTime: false,
  anyFieldIsDuration: false,
  anyFieldIsLocalDate: false,
  anyFieldIsBigDecimal: false,
  anyFieldIsBlobDerived: false,
  anyFieldHasImageContentType: false,
  anyFieldHasTextContentType: false,
  anyFieldHasFileBasedContentType: false,
  anyPropertyHasValidation: false,
  fieldsContainNoOwnerOneToOne: false,

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
  get differentRelationships() {
    return {};
  },
};

function _derivedProperties(entityWithConfig) {
  const pagination = entityWithConfig.pagination;
  const dto = entityWithConfig.dto;
  const service = entityWithConfig.service;
  _.defaults(entityWithConfig, {
    paginationPagination: pagination === PAGINATION,
    paginationInfiniteScroll: pagination === INFINITE_SCROLL,
    paginationNo: pagination === NO_PAGINATION,
    dtoMapstruct: dto === MAPSTRUCT,
    serviceImpl: service === SERVICE_IMPL,
    serviceNo: service === NO_SERVICE,
  });
}

export const entityDefaultConfig = {
  pagination: binaryOptions.DefaultValues[binaryOptions.Options.PAGINATION],
  anyPropertyHasValidation: false,
  dto: binaryOptions.DefaultValues[binaryOptions.Options.DTO],
  service: binaryOptions.DefaultValues[binaryOptions.Options.SERVICE],
  jpaMetamodelFiltering: false,
  readOnly: false,
  embedded: false,
  entityAngularJSSuffix: '',
  fluentMethods: true,
  clientRootFolder: '',
  get fields() {
    return [];
  },
  get relationships() {
    return [];
  },
};

export default function prepareEntity(entityWithConfig, generator, application) {
  const entityName = _.upperFirst(entityWithConfig.name);
  _.defaults(entityWithConfig, entityDefaultConfig, BASE_TEMPLATE_DATA);

  if (entityWithConfig.changelogDate) {
    entityWithConfig.changelogDateForRecent = parseChangelog(entityWithConfig.changelogDate);
  }

  entityWithConfig.entityAngularJSSuffix = entityWithConfig.angularJSSuffix;
  if (entityWithConfig.entityAngularJSSuffix && !entityWithConfig.entityAngularJSSuffix.startsWith('-')) {
    entityWithConfig.entityAngularJSSuffix = `-${entityWithConfig.entityAngularJSSuffix}`;
  }

  entityWithConfig.useMicroserviceJson = entityWithConfig.useMicroserviceJson || entityWithConfig.microserviceName !== undefined;
  entityWithConfig.microserviceAppName = '';
  if (generator.jhipsterConfig.applicationType === GATEWAY && entityWithConfig.useMicroserviceJson) {
    if (!entityWithConfig.microserviceName) {
      throw new Error('Microservice name for the entity is not found. Entity cannot be generated!');
    }
    entityWithConfig.microserviceAppName = generator.getMicroserviceAppName(entityWithConfig.microserviceName);
    entityWithConfig.skipServer = true;
  }

  _.defaults(entityWithConfig, {
    entityNameCapitalized: entityName,
    entityClass: _.upperFirst(entityName),
    entityInstance: _.lowerFirst(entityName),
    entityTableName: hibernateSnakeCase(entityName),
    entityNamePlural: pluralize(entityName),
  });

  const dto = entityWithConfig.dto && entityWithConfig.dto !== NO_DTO;
  if (dto) {
    _.defaults(entityWithConfig, {
      dtoClass: `${entityWithConfig.entityClass}${application.dtoSuffix ?? ''}`,
      dtoInstance: `${entityWithConfig.entityInstance}${application.dtoSuffix ?? ''}`,
    });
  }

  _.defaults(entityWithConfig, {
    persistClass: `${entityWithConfig.entityClass}${application.entitySuffix ?? ''}`,
    persistInstance: `${entityWithConfig.entityInstance}${application.entitySuffix ?? ''}`,
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
  entityWithConfig.entityFolderName = entityWithConfig.clientRootFolder
    ? `${entityWithConfig.clientRootFolder}/${entityWithConfig.entityFileName}`
    : entityWithConfig.entityFileName;
  entityWithConfig.entityModelFileName = entityWithConfig.entityFolderName;
  entityWithConfig.entityParentPathAddition = getEntityParentPathAddition(entityWithConfig.clientRootFolder);
  entityWithConfig.entityPluralFileName = entityWithConfig.entityNamePluralizedAndSpinalCased + entityWithConfig.entityAngularJSSuffix;
  entityWithConfig.entityServiceFileName = entityWithConfig.entityFileName;

  entityWithConfig.entityAngularName = entityWithConfig.entityClass + upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);
  entityWithConfig.entityAngularNamePlural = pluralize(entityWithConfig.entityAngularName);
  entityWithConfig.entityReactName = entityWithConfig.entityClass + upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);

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

  entityWithConfig.i18nKeyPrefix = `${entityWithConfig.frontendAppName}.${entityWithConfig.entityTranslationKey}`;
  entityWithConfig.i18nAlertHeaderPrefix = entityWithConfig.i18nKeyPrefix;
  if (entityWithConfig.microserviceAppName) {
    entityWithConfig.i18nAlertHeaderPrefix = `${entityWithConfig.microserviceAppName}.${entityWithConfig.entityTranslationKey}`;
  }

  const { microserviceName, entityFileName, microfrontend } = entityWithConfig;
  entityWithConfig.entityApi = microserviceName ? `services/${microserviceName.toLowerCase()}/` : '';
  entityWithConfig.entityPage =
    microfrontend && microserviceName && entityWithConfig.applicationType === MICROSERVICE
      ? `${microserviceName.toLowerCase()}/${entityFileName}`
      : `${entityFileName}`;

  const hasBuiltInUserField = entityWithConfig.relationships.some(relationship => relationship.otherEntity.builtInUser);
  entityWithConfig.saveUserSnapshot =
    application.applicationType === MICROSERVICE &&
    application.authenticationType === OAUTH2 &&
    hasBuiltInUserField &&
    entityWithConfig.dto === NO_MAPPER;

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
      generator.log.warn(`Error generating a full sample for entity ${entityName}`);
      return undefined;
    }
    return Object.fromEntries(fieldEntries);
  };
  _derivedProperties(entityWithConfig);

  return entityWithConfig;
}

export function derivedPrimaryKeyProperties(primaryKey) {
  _.defaults(primaryKey, {
    hasUUID: primaryKey.fields && primaryKey.fields.some(field => field.fieldType === UUID),
    hasLong: primaryKey.fields && primaryKey.fields.some(field => field.fieldType === LONG),
    typeUUID: primaryKey.type === UUID,
    typeString: primaryKey.type === STRING,
    typeLong: primaryKey.type === LONG,
    typeNumeric: !primaryKey.composite && primaryKey.fields[0].fieldTypeNumeric,
  });
}

export function prepareEntityPrimaryKeyForTemplates(entityWithConfig, generator, enableCompositeId = true) {
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
      // relationships id data are not available at this point, so calculate it when needed.
      relationship.derivedPrimaryKey = {
        get derivedFields() {
          return relationship.otherEntity.primaryKey.fields.map(field => ({
            originalField: field,
            ...field,
            derived: true,
            derivedEntity: relationship.otherEntity,
            jpaGeneratedValue: false,
            liquibaseAutoIncrement: false,
            // Mapsid is generated by relationship select
            autoGenerate: true,
            readonly: true,
            get derivedPath() {
              if (field.derivedPath) {
                if (relationship.otherEntity.primaryKey.derived) {
                  return [relationship.relationshipName, ...field.derivedPath.splice(1)];
                }
                return [relationship.relationshipName, ...field.derivedPath];
              }
              return [relationship.relationshipName, field.fieldName];
            },
            get path() {
              return [relationship.relationshipName, ...field.path];
            },
            get fieldName() {
              return idCount === 1 ? field.fieldName : `${relationship.relationshipName}${field.fieldNameCapitalized}`;
            },
            get fieldNameCapitalized() {
              return idCount === 1
                ? field.fieldNameCapitalized
                : `${relationship.relationshipNameCapitalized}${field.fieldNameCapitalized}`;
            },
            get columnName() {
              return idCount === 1 ? field.columnName : `${hibernateSnakeCase(relationship.relationshipName)}_${field.columnName}`;
            },
            get reference() {
              return fieldToReference(entityWithConfig, this);
            },
            get relationshipsPath() {
              return [relationship, ...field.relationshipsPath];
            },
          }));
        },
      };
    });
  }

  if (idCount === 1 && idRelationships.length === 1) {
    const relationshipId = idRelationships[0];
    // One-To-One relationships with id uses @MapsId.
    // Almost every info is taken from the parent, except some info like autoGenerate and derived.
    // calling fieldName as id is for backward compatibility, in the future we may want to prefix it with relationship name.
    entityWithConfig.primaryKey = {
      fieldName: 'id',
      derived: true,
      // MapsId copy the id from the relationship.
      autoGenerate: true,
      get fields() {
        return this.derivedFields;
      },
      get derivedFields() {
        return relationshipId.derivedPrimaryKey.derivedFields;
      },
      get ownFields() {
        return relationshipId.otherEntity.primaryKey.ownFields;
      },
      relationships: idRelationships,
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
      get ids() {
        return this.fields.map(field => fieldToId(field));
      },
    };
  } else {
    const composite = enableCompositeId ? idCount > 1 : false;
    let primaryKeyName;
    let primaryKeyType;
    if (composite) {
      primaryKeyName = 'id';
      primaryKeyType = `${entityWithConfig.entityClass}Id`;
    } else {
      const idField = idFields[0];
      idField.dynamic = false;
      // Allow ids type to be empty and fallback to default type for the database.
      if (!idField.fieldType) {
        idField.fieldType = generator.jhipsterConfig.pkType ?? getDatabaseTypeData(entityWithConfig.databaseType).defaultPrimaryKeyType;
      }
      primaryKeyName = idField.fieldName;
      primaryKeyType = idField.fieldType;
    }

    entityWithConfig.primaryKey = {
      derived: false,
      name: primaryKeyName,
      nameCapitalized: _.upperFirst(primaryKeyName),
      type: primaryKeyType,
      tsType: getTypescriptKeyType(primaryKeyType),
      composite,
      relationships: idRelationships,
      // Fields declared in this entity
      ownFields: idFields,
      // Fields declared and inherited
      get fields() {
        return [...this.ownFields, ...this.derivedFields];
      },
      get autoGenerate() {
        return this.composite ? false : this.fields[0].autoGenerate;
      },
      // Fields inherited from id relationships.
      get derivedFields() {
        return this.relationships.map(rel => rel.derivedPrimaryKey.derivedFields).flat();
      },
      get ids() {
        return this.fields.map(field => fieldToId(field));
      },
    };
  }
  return entityWithConfig;
}

function fieldToId(field) {
  return {
    field,
    get name() {
      return field.fieldName;
    },
    get nameCapitalized() {
      return field.fieldNameCapitalized;
    },
    get nameDotted() {
      return field.derivedPath ? field.derivedPath.join('.') : field.fieldName;
    },
    get nameDottedAsserted() {
      return field.derivedPath ? `${field.derivedPath.join('!.')}!` : `${field.fieldName}!`;
    },
    get setter() {
      return `set${this.nameCapitalized}`;
    },
    get getter() {
      return (field.fieldType === BOOLEAN ? 'is' : 'get') + this.nameCapitalized;
    },
    get autoGenerate() {
      return !!field.autoGenerate;
    },
    get relationshipsPath() {
      return field.relationshipsPath;
    },
  };
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
export function loadRequiredConfigIntoEntity(entity, config) {
  _.defaults(entity, {
    applicationType: config.applicationType,
    baseName: config.baseName,
    frontendAppName: config.frontendAppName,
    authenticationType: config.authenticationType,
    reactive: config.reactive,
    microfrontend: config.microfrontend,
    // Workaround different paths
    clientFramework: config.clientFramework,

    databaseType: config.databaseType,
    prodDatabaseType: config.prodDatabaseType,

    skipUiGrouping: config.skipUiGrouping,
    searchEngine: config.searchEngine,

    jhiPrefix: config.jhiPrefix,
    entitySuffix: config.entitySuffix,
    dtoSuffix: config.dtoSuffix,
    packageName: config.packageName,
    packageFolder: config.packageFolder,
  });
  if (config.applicationType === MICROSERVICE) {
    _.defaults(entity, {
      microserviceName: config.baseName,
    });
  }
  return entity;
}

export function preparePostEntityCommonDerivedProperties(entity: Entity) {
  const { fields } = entity;
  const fieldsType = sortedUniq(fields.map(({ fieldType }) => fieldType).filter(fieldType => !fieldIsEnum(fieldType)));

  // TODO move to server generator
  entity.anyFieldHasDocumentation = entity.fields.some(({ javadoc }) => javadoc);

  entity.anyFieldIsZonedDateTime = fieldsType.includes(ZONED_DATE_TIME);
  entity.anyFieldIsInstant = fieldsType.includes(INSTANT);
  entity.anyFieldIsDuration = fieldsType.includes(DURATION);
  entity.anyFieldIsLocalDate = fieldsType.includes(LOCAL_DATE);
  entity.anyFieldIsBigDecimal = fieldsType.includes(BIG_DECIMAL);
  entity.anyFieldIsUUID = fieldsType.includes(UUID);

  entity.anyFieldIsTimeDerived = entity.anyFieldIsZonedDateTime || entity.anyFieldIsInstant;
  entity.anyFieldIsDateDerived = entity.anyFieldIsTimeDerived || entity.anyFieldIsLocalDate;

  entity.anyFieldIsBlobDerived = intersection(fieldsType, [BYTES, BYTE_BUFFER]).length > 0;
  if (entity.anyFieldIsBlobDerived) {
    const blobFields = fields.filter(({ fieldType }) => [BYTES, BYTE_BUFFER].includes(fieldType));
    const blobFieldsContentType = sortedUniq(blobFields.map(({ fieldTypeBlobContent }) => fieldTypeBlobContent));
    entity.anyFieldHasImageContentType = blobFieldsContentType.includes(IMAGE);
    entity.anyFieldHasFileBasedContentType = blobFieldsContentType.some(fieldTypeBlobContent => fieldTypeBlobContent !== TEXT);
    entity.anyFieldHasTextContentType = blobFieldsContentType.includes(TEXT);
  }

  preparePostEntityCommonDerivedPropertiesNotTyped(entity);
}

function preparePostEntityCommonDerivedPropertiesNotTyped(entity: any) {
  const { relationships, fields } = entity;
  const oneToOneRelationships = relationships.filter(({ relationshipType }) => relationshipType === 'one-to-one');
  entity.fieldsContainNoOwnerOneToOne = oneToOneRelationships.some(({ ownerSide }) => !ownerSide);

  entity.anyPropertyHasValidation =
    entity.anyPropertyHasValidation || relationships.some(({ relationshipValidate }) => relationshipValidate);

  const relationshipsByOtherEntity = relationships
    .filter(rel => !rel.otherEntity.embedded)
    .map(relationship => [relationship.otherEntity.entityNameCapitalized, relationship])
    .reduce((relationshipsByOtherEntity: any, [type, relationship]) => {
      if (!relationshipsByOtherEntity[type]) {
        relationshipsByOtherEntity[type] = [relationship];
      } else {
        relationshipsByOtherEntity[type].push(relationship);
      }
      return relationshipsByOtherEntity;
    }, {});

  entity.relationshipsByOtherEntity = relationshipsByOtherEntity;
  entity.differentRelationships = relationshipsByOtherEntity;

  entity.anyPropertyHasValidation = entity.anyPropertyHasValidation || fields.some(({ fieldValidate }) => fieldValidate);

  entity.allReferences = [
    ...entity.fields.map(field => field.reference),
    ...entity.relationships.map(relationship => relationship.reference),
  ];

  entity.otherEntities = _.uniq(entity.relationships.map(rel => rel.otherEntity));

  entity.updatableEntity =
    entity.fields.some(field => !field.id && !field.transient) ||
    entity.relationships.some(relationship => !relationship.id && relationship.ownerSide);

  entity.allReferences
    .filter(reference => reference.relationship && reference.relationship.relatedField)
    .forEach(reference => {
      reference.relatedReference = reference.relationship.relatedField.reference;
    });

  entity.relationships.forEach(relationship => {
    relationship.relationshipCollection = ['one-to-many', 'many-to-many'].includes(relationship.relationshipType);
    relationship.relationshipReferenceField = relationship.relationshipCollection
      ? relationship.relationshipFieldNamePlural
      : relationship.relationshipFieldName;
  });
  entity.entityContainsCollectionField = entity.relationships.some(relationship => relationship.relationshipCollection);

  if (entity.primaryKey) {
    derivedPrimaryKeyProperties(entity.primaryKey);
    entity.requiresPersistableImplementation =
      entity.requiresPersistableImplementation || entity.fields.some(field => field.requiresPersistableImplementation);
  }

  const types = entity.relationships
    .filter(rel => rel.otherEntity.primaryKey)
    .map(rel => rel.otherEntity.primaryKey.fields.map(f => f.fieldType))
    .flat();
  entity.otherEntityPrimaryKeyTypes = Array.from(new Set(types));
  entity.otherEntityPrimaryKeyTypesIncludesUUID = types.includes(UUID);

  entity.relationships.forEach(relationship => {
    if (!relationship.otherEntity.primaryKey) {
      relationship.bagRelationship = false;
      relationship.relationshipEagerLoad = false;
      return;
    }
    relationship.bagRelationship = relationship.ownerSide && relationship.collection;
    if (relationship.relationshipEagerLoad === undefined) {
      relationship.relationshipEagerLoad =
        relationship.bagRelationship ||
        entity.eagerLoad ||
        // Fetch relationships if otherEntityField differs otherwise the id is enough
        (relationship.ownerSide && relationship.otherEntity.primaryKey.name !== relationship.otherEntityField);
    }
  });
  entity.relationshipsContainEagerLoad = entity.relationships.some(relationship => relationship.relationshipEagerLoad);
  entity.containsBagRelationships = entity.relationships.some(relationship => relationship.bagRelationship);
  entity.implementsEagerLoadApis = // Cassandra doesn't provides *WithEagerReationships apis
    ![CASSANDRA, COUCHBASE, NEO4J].includes(entity.databaseType) &&
    // Only sql and mongodb provides *WithEagerReationships apis for imperative implementation
    (entity.reactive || [SQL, MONGODB].includes(entity.databaseType)) &&
    entity.relationshipsContainEagerLoad;
  entity.eagerRelations = entity.relationships.filter(rel => rel.relationshipEagerLoad);
  entity.regularEagerRelations = entity.eagerRelations.filter(rel => rel.id !== true);

  entity.reactiveEagerRelations = entity.relationships.filter(
    rel => rel.relationshipType === 'many-to-one' || (rel.relationshipType === 'one-to-one' && rel.ownerSide === true)
  );
  entity.reactiveRegularEagerRelations = entity.reactiveEagerRelations.filter(rel => rel.id !== true);
}

export function preparePostEntitiesCommonDerivedProperties(entities) {
  for (const entity of entities.filter(entity => !entity.dtoReferences)) {
    entity.dtoReferences = [
      ...entity.fields.map(field => field.reference),
      ...entity.relationships
        .map(relationship => relationship.reference)
        .filter(reference => reference.owned || reference.relationship.otherEntity.embedded),
    ];
    entity.otherReferences = entity.otherRelationships.map(relationship => relationship.reference);
  }

  for (const entity of entities.filter(entity => !entity.otherDtoReferences)) {
    // Get all required back references for dto.
    entity.otherDtoReferences = entity.otherReferences.filter(reference => reference.entity.dtoReferences.includes(reference));
  }
}

export async function addFakerToEntity(entityWithConfig: any, nativeLanguage = 'en') {
  entityWithConfig.faker = entityWithConfig.faker || (await createFaker(nativeLanguage));
  entityWithConfig.resetFakerSeed = (suffix = '') =>
    entityWithConfig.faker.seed(stringHashCode(entityWithConfig.name.toLowerCase() + suffix));
  entityWithConfig.resetFakerSeed();
}

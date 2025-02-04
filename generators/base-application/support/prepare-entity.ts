/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { camelCase, intersection, kebabCase, lowerFirst, sortedUniq, startCase, uniq, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import type BaseGenerator from '../../base-core/index.js';
import { getDatabaseTypeData, hibernateSnakeCase } from '../../server/support/index.js';
import {
  createFaker,
  getMicroserviceAppName,
  mutateData,
  parseChangelog,
  stringHashCode,
  upperFirstCamelCase,
} from '../../base/support/index.js';
import { getEntityParentPathAddition, getTypescriptKeyType } from '../../client/support/index.js';
import { applicationTypes, databaseTypes, entityOptions, fieldTypes, searchEngineTypes } from '../../../lib/jhipster/index.js';
import { binaryOptions } from '../../../lib/jdl/core/built-in-options/index.js';

import type { Entity } from '../../../lib/types/application/index.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { PrimaryKey } from '../../../lib/types/application/entity.js';
import type { ApplicationConfiguration } from '../../../lib/types/application/yo-rc.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';
import { fieldToReference } from './prepare-field.js';
import { fieldIsEnum } from './field-utils.js';

const NO_SEARCH_ENGINE = searchEngineTypes.NO;
const { MapperTypes } = entityOptions;
const { GATEWAY, MICROSERVICE } = applicationTypes;
const { CommonDBTypes } = fieldTypes;

const { BOOLEAN, LONG, STRING, UUID, INTEGER } = CommonDBTypes;
const { NO: NO_DTO } = MapperTypes;
const NO_MAPPER = MapperTypes.NO;

const { CASSANDRA, COUCHBASE, NEO4J, SQL, MONGODB } = databaseTypes;

const { INSTANT, ZONED_DATE_TIME, DURATION, LOCAL_DATE, BIG_DECIMAL, LOCAL_TIME } = fieldTypes.CommonDBTypes;

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
  entityAuthority: undefined,
  entityReadAuthority: undefined,
  adminEntity: undefined,
  builtInUserManagement: undefined,

  requiresPersistableImplementation: false,
  updatableEntity: undefined,
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

function _derivedProperties(entityWithConfig: Entity) {
  const pagination = entityWithConfig.pagination;
  const dto = entityWithConfig.dto;
  const service = entityWithConfig.service;
  mutateData(entityWithConfig, {
    paginationPagination: pagination === 'pagination',
    paginationInfiniteScroll: pagination === 'infinite-scroll',
    paginationNo: pagination === 'no',
    dtoMapstruct: dto === 'mapstruct' || dto === 'any',
    dtoAny: dto && dto !== 'no',
    serviceClass: service === 'serviceClass',
    serviceImpl: service === 'serviceImpl',
    serviceNo: service === 'no',
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

export default function prepareEntity(entityWithConfig: Entity, generator, application: ApplicationType) {
  const { applicationTypeMicroservice, microfrontend } = application;

  const entityName = upperFirst(entityWithConfig.name);
  const entitySuffix = entityWithConfig.entitySuffix ?? application.entitySuffix;
  mutateData(entityWithConfig, entityDefaultConfig, BASE_TEMPLATE_DATA);

  if (entityWithConfig.changelogDate) {
    try {
      entityWithConfig.changelogDateForRecent = parseChangelog(String(entityWithConfig.changelogDate));
    } catch (error: unknown) {
      throw new Error(`Error parsing changelog date for entity ${entityName}: ${(error as Error).message}`, { cause: error });
    }
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
    entityWithConfig.microserviceAppName = getMicroserviceAppName({ microserviceName: entityWithConfig.microserviceName });
    entityWithConfig.skipServer = true;
  }

  mutateData(entityWithConfig, {
    entityNameCapitalized: entityName,
    entityClass: upperFirst(entityName),
    entityInstance: lowerFirst(entityName),
    entityTableName: hibernateSnakeCase(entityName),
    entityNamePlural: pluralize(entityName),
    entityAuthority: entityWithConfig.adminEntity ? 'ROLE_ADMIN' : undefined,
  });

  mutateData(entityWithConfig, {
    persistClass: `${entityWithConfig.entityClass}${entitySuffix ?? ''}`,
    persistInstance: `${entityWithConfig.entityInstance}${entitySuffix ?? ''}`,
  });

  const dto = entityWithConfig.dto && entityWithConfig.dto !== NO_DTO;
  if (dto) {
    const { dtoSuffix = '' } = application;
    mutateData(entityWithConfig, {
      dtoClass: `${entityWithConfig.entityClass}${dtoSuffix}`,
      dtoInstance: `${entityWithConfig.entityInstance}${dtoSuffix}`,
      restClass: ({ dtoClass }) => dtoClass!,
      restInstance: ({ dtoInstance }) => dtoInstance!,
    });
  } else {
    mutateData(entityWithConfig, {
      restClass: ({ persistClass }) => persistClass!,
      restInstance: ({ persistInstance }) => persistInstance!,
    });
  }

  mutateData(entityWithConfig, {
    entityNamePluralizedAndSpinalCased: kebabCase(entityWithConfig.entityNamePlural),
    entityClassPlural: upperFirst(entityWithConfig.entityNamePlural),
    entityInstancePlural: lowerFirst(entityWithConfig.entityNamePlural),
  });

  mutateData(entityWithConfig, {
    // Implement i18n variant ex: 'male', 'female' when applied
    entityI18nVariant: 'default',
    entityClassHumanized: startCase(entityWithConfig.entityNameCapitalized),
    entityClassPluralHumanized: startCase(entityWithConfig.entityClassPlural),
  });

  mutateData(entityWithConfig, {
    __override__: false,
    entityFileName: data => kebabCase(data.entityNameCapitalized + upperFirst(data.entityAngularJSSuffix)),
    entityAngularName: data => data.entityClass + upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix!),
    entityAngularNamePlural: data => pluralize(data.entityAngularName),
    entityApiUrl: data => data.entityNamePluralizedAndSpinalCased,
  });
  entityWithConfig.entityFolderName = entityWithConfig.clientRootFolder
    ? `${entityWithConfig.clientRootFolder}/${entityWithConfig.entityFileName}`
    : entityWithConfig.entityFileName;
  entityWithConfig.entityModelFileName = entityWithConfig.entityFolderName;
  entityWithConfig.entityParentPathAddition = getEntityParentPathAddition(entityWithConfig.clientRootFolder);
  entityWithConfig.entityPluralFileName = entityWithConfig.entityNamePluralizedAndSpinalCased + entityWithConfig.entityAngularJSSuffix;
  entityWithConfig.entityServiceFileName = entityWithConfig.entityFileName;

  entityWithConfig.entityReactName = entityWithConfig.entityClass + upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix);

  entityWithConfig.entityStateName = kebabCase(entityWithConfig.entityAngularName);
  entityWithConfig.entityUrl = entityWithConfig.entityStateName;

  entityWithConfig.entityTranslationKey = entityWithConfig.clientRootFolder
    ? camelCase(`${entityWithConfig.clientRootFolder}-${entityWithConfig.entityInstance}`)
    : entityWithConfig.entityInstance;
  entityWithConfig.entityTranslationKeyMenu = camelCase(
    entityWithConfig.clientRootFolder
      ? `${entityWithConfig.clientRootFolder}-${entityWithConfig.entityStateName}`
      : entityWithConfig.entityStateName,
  );

  mutateData(entityWithConfig, {
    __override__: false,
    i18nKeyPrefix: data => data.i18nKeyPrefix ?? `${application.frontendAppName}.${data.entityTranslationKey}`,
    i18nAlertHeaderPrefix: data =>
      (data.i18nAlertHeaderPrefix ?? data.microserviceAppName)
        ? `${data.microserviceAppName}.${data.entityTranslationKey}`
        : data.i18nKeyPrefix,
    hasRelationshipWithBuiltInUser: ({ relationships }) => relationships.some(relationship => relationship.otherEntity.builtInUser),
    saveUserSnapshot: ({ hasRelationshipWithBuiltInUser, dto }) =>
      applicationTypeMicroservice && application.authenticationTypeOauth2 && hasRelationshipWithBuiltInUser && dto === NO_MAPPER,
    entityApi: ({ microserviceName }) => (microserviceName ? `services/${microserviceName.toLowerCase()}/` : ''),
    entityPage: ({ microserviceName, entityFileName }) =>
      microserviceName && microfrontend && applicationTypeMicroservice
        ? `${microserviceName.toLowerCase()}/${entityFileName}`
        : `${entityFileName}`,
  });

  entityWithConfig.generateFakeData = type => {
    const fieldsToGenerate =
      type === 'cypress' ? entityWithConfig.fields.filter(field => !field.id || !field.autoGenerate) : entityWithConfig.fields;
    const fieldEntries: [string, any][] = fieldsToGenerate
      .map(field => {
        const fieldData = field.generateFakeData!(type);
        if (!field.nullable && fieldData === null) return undefined;
        return [field.fieldName, fieldData];
      })
      .filter(Boolean) as any;
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

export function derivedPrimaryKeyProperties(primaryKey: PrimaryKey) {
  mutateData(primaryKey, {
    hasUUID: primaryKey.fields?.some(field => field.fieldType === UUID),
    hasLong: primaryKey.fields?.some(field => field.fieldType === LONG),
    hasInteger: primaryKey.fields?.some(field => field.fieldType === INTEGER),
    typeUUID: primaryKey.type === UUID,
    typeString: primaryKey.type === STRING,
    typeLong: primaryKey.type === LONG,
    typeInteger: primaryKey.type === INTEGER,
    typeNumeric: !primaryKey.composite && primaryKey.fields[0].fieldTypeNumeric,
  } as any);
}

export function prepareEntityPrimaryKeyForTemplates(
  this: CoreGenerator | void,
  { entity: entityWithConfig, enableCompositeId = true, application }: { entity: any; enableCompositeId?: boolean; application?: any },
) {
  const idFields = entityWithConfig.fields.filter(field => field.id);
  const idRelationships = entityWithConfig.relationships.filter(relationship => relationship.id);
  let idCount = idFields.length + idRelationships.length;

  if (idCount === 0) {
    let idField = entityWithConfig.fields.find(field => field.fieldName === 'id');
    if (idField) {
      idField.id = true;
      idField.autoGenerate = idField.autoGenerate ?? true;
    } else {
      if (entityWithConfig.microserviceName && !application?.microfrontend) {
        this?.log.warn(
          "Microservice entities should have the id field type specified (e.g., id String) to make sure gateway and microservice types don't conflict",
        );
      }
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
      get hibernateSnakeCaseName() {
        return hibernateSnakeCase(relationshipId.otherEntity.primaryKey.name);
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
        idField.fieldType = application?.pkType ?? getDatabaseTypeData(entityWithConfig.databaseType).defaultPrimaryKeyType;
      }
      primaryKeyName = idField.fieldName;
      primaryKeyType = idField.fieldType;
    }

    entityWithConfig.primaryKey = {
      derived: false,
      name: primaryKeyName,
      hibernateSnakeCaseName: hibernateSnakeCase(primaryKeyName),
      nameCapitalized: upperFirst(primaryKeyName),
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
export function loadRequiredConfigIntoEntity<E extends Partial<Entity>>(
  this: BaseGenerator | void,
  entity: E,
  config: ApplicationConfiguration,
): E {
  mutateData(entity, {
    __override__: false,
    applicationType: config.applicationType,
    baseName: config.baseName,
    authenticationType: config.authenticationType,
    reactive: config.reactive,
    microfrontend: config.microfrontend,
    // Workaround different paths
    clientFramework: config.clientFramework,

    databaseType: config.databaseType,
    prodDatabaseType: config.prodDatabaseType,

    searchEngine: config.searchEngine,

    jhiPrefix: config.jhiPrefix,
    entitySuffix: config.entitySuffix,
    dtoSuffix: config.dtoSuffix,
    packageName: config.packageName,
    microserviceName: ({ builtIn }) => (!builtIn && config.applicationType === MICROSERVICE ? config.baseName : undefined),
  } as any);
  if ((entity as any).searchEngine === true && (!entity.microserviceName || entity.microserviceName === config.baseName)) {
    // If the entity belongs to this application and searchEngine is true.
    if (config.searchEngine && config.searchEngine !== NO_SEARCH_ENGINE) {
      // Replace with the searchEngine from the application.
      entity.searchEngine = config.searchEngine;
    } else {
      entity.searchEngine = NO_SEARCH_ENGINE;
      this?.log.warn('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
    }
  }
  return entity;
}

export function preparePostEntityCommonDerivedProperties(entity: Entity) {
  const { fields } = entity;
  const fieldsType = sortedUniq(fields.map(({ fieldType }) => fieldType).filter(fieldType => !fieldIsEnum(fieldType)));

  // TODO move to server generator
  entity.anyFieldHasDocumentation = entity.fields.some(({ documentation }) => documentation);

  entity.anyFieldIsZonedDateTime = fieldsType.includes(ZONED_DATE_TIME);
  entity.anyFieldIsInstant = fieldsType.includes(INSTANT);
  entity.anyFieldIsLocalTime = fieldsType.includes(LOCAL_TIME);
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

  const relationshipsByOtherEntity: Record<string, any> = relationships
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
  entity.persistableOtherEntities = Object.values(relationshipsByOtherEntity).filter(relationships =>
    relationships.some(({ persistableRelationship, otherEntity }) => persistableRelationship && otherEntity !== entity),
  );

  entity.anyPropertyHasValidation = entity.anyPropertyHasValidation || fields.some(({ fieldValidate }) => fieldValidate);

  entity.allReferences = [
    ...entity.fields.map(field => field.reference),
    ...entity.relationships.map(relationship => relationship.reference),
  ];

  entity.otherEntities = uniq(entity.relationships.map(rel => rel.otherEntity));

  entity.persistableRelationships = relationships.filter(({ persistableRelationship }) => persistableRelationship);
  entity.otherEntitiesWithPersistableRelationship = uniq(entity.persistableRelationships.map(rel => rel.otherEntity));

  entity.updatableEntity =
    entity.fields.some(field => !field.id && !field.transient) ||
    entity.relationships.some(relationship => !relationship.id && relationship.persistableRelationship);

  entity.allReferences
    .filter(reference => reference.relationship?.relatedField)
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

    mutateData(relationship, {
      bagRelationship: relationship.ownerSide && relationship.collection,
      relationshipEagerLoad: ({ relationshipEagerLoad, bagRelationship, ownerSide, otherEntity, otherEntityField }) =>
        relationshipEagerLoad ??
        (bagRelationship ||
          entity.eagerLoad ||
          // Fetch relationships if otherEntityField differs otherwise the id is enough
          (ownerSide && otherEntity.primaryKey.name !== otherEntityField)),
    } as any);
  });
  entity.relationshipsContainEagerLoad = entity.relationships.some(relationship => relationship.relationshipEagerLoad);
  entity.containsBagRelationships = entity.relationships.some(relationship => relationship.bagRelationship);
  entity.implementsEagerLoadApis = // Cassandra doesn't provides *WithEagerRelationships apis
    ![CASSANDRA, COUCHBASE, NEO4J].includes(entity.databaseType) &&
    // Only sql and mongodb provides *WithEagerRelationships apis for imperative implementation
    (entity.reactive || [SQL, MONGODB].includes(entity.databaseType)) &&
    entity.relationshipsContainEagerLoad;
  entity.eagerRelations = entity.relationships.filter(rel => rel.relationshipEagerLoad);
  entity.regularEagerRelations = entity.eagerRelations.filter(rel => rel.id !== true);

  entity.reactiveEagerRelations = entity.relationships.filter(
    rel => rel.relationshipType === 'many-to-one' || (rel.relationshipType === 'one-to-one' && rel.ownerSide === true),
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
    entity.restProperties = [
      ...entity.fields,
      ...entity.relationships.filter(
        relationship => relationship.persistableRelationship || relationship.relationshipEagerLoad || relationship.otherEntity.embedded,
      ),
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

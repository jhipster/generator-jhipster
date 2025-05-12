import { camelCase, kebabCase, lowerFirst, startCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';
import { mutateData } from '../../../lib/utils/object.js';
import { getMicroserviceAppName, parseChangelog, upperFirstCamelCase } from '../../base/support/index.js';
import { hibernateSnakeCase } from '../../server/support/index.js';
import { getEntityParentPathAddition } from '../../client/support/index.js';
import { entityDefaultConfig } from '../../base-application/support/prepare-entity.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';
import type { Entity } from '../../../lib/types/application/entity.js';
import { applicationTypes, entityOptions, searchEngineTypes } from '../../../lib/jhipster/index.js';
const { MapperTypes } = entityOptions;
const { GATEWAY } = applicationTypes;
const { NO: NO_DTO } = MapperTypes;
const NO_MAPPER = MapperTypes.NO;
const NO_SEARCH_ENGINE = searchEngineTypes.NO;

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

export default function prepareEntity(entityWithConfig: Entity, generator, application: ApplicationType) {
  const { applicationTypeMicroservice, microfrontend, dtoSuffix = '' } = application;

  const entityName = upperFirst(entityWithConfig.name);
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
    entityNamePlural: pluralize(entityName),
    entityNamePluralizedAndSpinalCased: ({ entityNamePlural }) => kebabCase(entityNamePlural),
    entityClass: upperFirst(entityName),
    entityClassPlural: ({ entityNamePlural }) => upperFirst(entityNamePlural),
    entityInstance: lowerFirst(entityName),
    entityInstancePlural: ({ entityNamePlural }) => lowerFirst(entityNamePlural),
    entityTableName: hibernateSnakeCase(entityName),
    entityAuthority: entityWithConfig.adminEntity ? 'ROLE_ADMIN' : undefined,
  });

  const entitySuffix = entityWithConfig.entitySuffix ?? application.entitySuffix;
  const dto = entityWithConfig.dto && entityWithConfig.dto !== NO_DTO;
  mutateData(entityWithConfig, {
    persistClass: `${entityWithConfig.entityClass}${entitySuffix ?? ''}`,
    persistInstance: `${entityWithConfig.entityInstance}${entitySuffix ?? ''}`,
    // Even if dto is not used, we need to generate the dtoClass and dtoInstance is added to avoid errors in rendered relationships templates. The resulting class will not exist then.
    dtoClass: `${entityWithConfig.entityClass}${dtoSuffix}`,
    dtoInstance: `${entityWithConfig.entityInstance}${dtoSuffix}`,
    restClass: dto ? ({ dtoClass }) => dtoClass! : ({ persistClass }) => persistClass!,
    restInstance: dto ? ({ dtoInstance }) => dtoInstance! : ({ persistInstance }) => persistInstance!,
  });

  mutateData(entityWithConfig, {
    // Implement i18n variant ex: 'male', 'female' when applied
    entityI18nVariant: 'default',
    entityClassHumanized: ({ entityNameCapitalized }) => startCase(entityNameCapitalized),
    entityClassPluralHumanized: ({ entityNamePlural }) => startCase(entityNamePlural),
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

  entityWithConfig.entityReactName = entityWithConfig.entityClass + upperFirstCamelCase(entityWithConfig.entityAngularJSSuffix || '');

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

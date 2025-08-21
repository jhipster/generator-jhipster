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
import { camelCase, kebabCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import { mutateData } from '../../../../lib/utils/object.ts';
import { normalizePathEnd } from '../../../../lib/utils/path.ts';
import { upperFirstCamelCase } from '../../../../lib/utils/string.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Entity as CommonEntity,
  Options as CommonOptions,
} from '../../types.ts';

export default class BootstrapGenerator extends BaseApplicationGenerator<CommonEntity, CommonApplication, CommonConfig, CommonOptions> {
  customLifecycle = true;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('javascript');
    await this.dependsOnBootstrap('languages');
  }

  get [BaseApplicationGenerator.BOOTSTRAP_APPLICATION]() {
    return this.asBootstrapApplicationTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults({
          packageJsonScripts: {},
          clientPackageJsonScripts: {},
          dockerContainers: {},
          authenticationUsesCsrf: undefined,
          gatewayRoutes: undefined,
        });
      },
    });
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ applicationDefaults }) {
        applicationDefaults({
          authenticationUsesCsrf: ({ authenticationType }) => ['oauth2', 'session'].includes(authenticationType!),
          endpointPrefix: ({ applicationType, lowercaseBaseName }) =>
            applicationType === 'microservice' ? `services/${lowercaseBaseName}` : '',
        });
      },
      userRelationship({ application }) {
        mutateData(application, {
          anyEntityHasRelationshipWithUser: this.getExistingEntities().some(entity =>
            (entity.definition.relationships ?? []).some(relationship => relationship.otherEntityName.toLowerCase() === 'user'),
          ),
        });
      },
      syncUserWithIdp({ application, applicationDefaults }) {
        if (application.authenticationType === 'oauth2') {
          applicationDefaults({
            syncUserWithIdp: data =>
              application.backendTypeSpringBoot &&
              data.databaseType !== 'no' &&
              (data.applicationType === 'gateway' || data.anyEntityHasRelationshipWithUser),
          });
        }
        if (application.syncUserWithIdp && application.authenticationType !== 'oauth2') {
          throw new Error('syncUserWithIdp is only supported with oauth2 authenticationType');
        }
      },
      userManagement({ application, applicationDefaults }) {
        const generateAuthenticationApi = application.applicationTypeMonolith || application.applicationTypeGateway;
        const authenticationApiWithUserManagement = Boolean(!application.authenticationTypeOauth2 && generateAuthenticationApi);

        applicationDefaults({
          generateAuthenticationApi,
          generateUserManagement: data => !data.skipUserManagement && data.databaseType !== 'no' && authenticationApiWithUserManagement,
          generateInMemoryUserCredentials: data => !data.generateUserManagement && authenticationApiWithUserManagement,

          generateBuiltInUserEntity: ({ generateUserManagement, syncUserWithIdp }) => generateUserManagement || syncUserWithIdp,
          generateBuiltInAuthorityEntity: ({ generateBuiltInUserEntity, databaseType }) =>
            generateBuiltInUserEntity! && databaseType !== 'cassandra',
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntity({ application, entity }) {
        mutateData(entity, {
          __override__: true,
          entityAngularJSSuffix: data => {
            const entityAngularJSSuffix = data.entityAngularJSSuffix ?? data.angularJSSuffix ?? '';
            return entityAngularJSSuffix.startsWith('-') || !entityAngularJSSuffix ? entityAngularJSSuffix : `-${entityAngularJSSuffix}`;
          },
        });

        mutateData(entity, {
          __override__: false,
          // Implement i18n variant ex: 'male', 'female' when applied
          entityI18nVariant: 'default',
          clientRootFolder: '',
          entityFileName: data => kebabCase(data.entityNameCapitalized + upperFirst(data.entityAngularJSSuffix)),
          entityAngularName: data => upperFirst(data.entityNameCapitalized) + upperFirstCamelCase(data.entityAngularJSSuffix!),
          entityReactName: data => upperFirst(data.entityNameCapitalized) + upperFirstCamelCase(data.entityAngularJSSuffix!),
          entityAngularNamePlural: data => pluralize(data.entityAngularName),
          entityApiUrl: data => data.entityNamePluralizedAndSpinalCased,
          entityFolderName: data => `${normalizePathEnd(data.clientRootFolder)}${data.entityFileName}`,
          entityModelFileName: data => data.entityFolderName,
          entityPluralFileName: data => `${data.entityNamePluralizedAndSpinalCased}${data.entityAngularJSSuffix}`,
          entityServiceFileName: data => data.entityFileName,
          entityStateName: data => kebabCase(data.entityAngularName),
          entityUrl: data => data.entityStateName,
          entityTranslationKey: data =>
            data.clientRootFolder ? camelCase(`${data.clientRootFolder}-${data.entityInstance}`) : data.entityInstance,
          entityTranslationKeyMenu: data =>
            camelCase(data.clientRootFolder ? `${data.clientRootFolder}-${data.entityStateName}` : data.entityStateName),
          i18nKeyPrefix: data => data.i18nKeyPrefix ?? `${application.frontendAppName}.${data.entityTranslationKey}`,
          i18nAlertHeaderPrefix: data =>
            (data.i18nAlertHeaderPrefix ?? data.microserviceAppName)
              ? `${data.microserviceAppName}.${data.entityTranslationKey}`
              : data.i18nKeyPrefix,
          entityApi: ({ microserviceName }) => (microserviceName ? `services/${microserviceName.toLowerCase()}/` : ''),
          entityPage: ({ microserviceName, entityFileName }) =>
            microserviceName && application.microfrontend && application.applicationTypeMicroservice
              ? `${microserviceName.toLowerCase()}/${entityFileName}`
              : `${entityFileName}`,
          paginationPagination: data => data.pagination === 'pagination',
          paginationInfiniteScroll: data => data.pagination === 'infinite-scroll',
          paginationNo: data => data.pagination === 'no',
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      postPreparingEntities({ entities }) {
        for (const entity of entities) {
          mutateData(entity, {
            __override__: false,
            restProperties: () => [
              ...entity.fields,
              ...entity.relationships.filter(
                relationship =>
                  relationship.persistableRelationship || relationship.relationshipEagerLoad || relationship.otherEntity.embedded,
              ),
            ],
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

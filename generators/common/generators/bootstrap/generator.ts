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

import { mutateData } from '../../../../lib/utils/object.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { mutateEntity as commonMutateEntity, mutateField as commonMutateField } from '../../entity.ts';
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
      prepareEntity({ entity }) {
        mutateData(entity, commonMutateEntity);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      preparing({ field }) {
        mutateData(field, commonMutateField);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
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

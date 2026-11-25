/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { mutateDefaults } from '../../../../lib/utils/object.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { mutateApplication } from '../../application.ts';
import { mutateEntity as commonMutateEntity, mutateField as commonMutateField } from '../../entity.ts';
import { getJsonType, jsonTypeDerivedProperties } from '../../internal/json-type.ts';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Entity as CommonEntity,
  Options as CommonOptions,
} from '../../types.ts';

export default class BootstrapGenerator extends BaseApplicationGenerator<CommonEntity, CommonApplication, CommonConfig, CommonOptions> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('javascript-simple-application');
    await this.dependsOnBootstrap('base-application');
    await this.dependsOnBootstrap('languages');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults({
          dockerContainers: () => ({}),
          authenticationUsesCsrf: undefined,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults(mutateApplication, {
          jwtSecretKey: undefined,
        });
      },
      syncUserWithIdp({ application }) {
        if (application.syncUserWithIdp && application.authenticationType !== 'oauth2') {
          throw new Error('syncUserWithIdp is only supported with oauth2 authenticationType');
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get postLoadingEntities() {
    return this.asPostLoadingEntitiesTaskGroup({
      loadEntities({ application, entitiesToLoad }) {
        for (const { entityBootstrap } of entitiesToLoad) {
          mutateDefaults(entityBootstrap, {
            // The entities of a microservice belong to it, but the built-in ones.
            microserviceName: ({ builtIn }, { undefinedMarker }) =>
              !builtIn && application.applicationTypeMicroservice ? application.baseName : undefinedMarker,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_LOADING_ENTITIES]() {
    return this.postLoadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entityDefaults }) {
        entityDefaults(commonMutateEntity);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      preparing({ fieldDefaults }) {
        fieldDefaults(commonMutateField);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      primaryKeyJsonType({ entity }) {
        const { primaryKey } = entity;
        if (primaryKey) {
          mutateDefaults(primaryKey, {
            jsonType: ({ composite, type }) => (composite ? undefined : getJsonType(type)),
            ...jsonTypeDerivedProperties,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      postPreparingEntities({ entities }) {
        for (const entity of entities) {
          mutateDefaults(entity, {
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
      hasNonBuiltInEntity({ application, entities }) {
        // An entity of the entities menu of the client.
        application.hasNonBuiltInEntity = entities.some(
          e => !e.builtInUser && !e.builtInUserManagement && !e.builtInAuthority && !e.embedded && !e.skipClient,
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

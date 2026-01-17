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

import { upperFirst } from 'lodash-es';

import { mutateData } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { loadRequiredConfigIntoEntity } from '../../../base-application/support/index.ts';
import type { Application as BaseApplicationApplication, Entity as BaseApplicationEntity } from '../../../base-application/types.d.ts';
import { loadDockerDependenciesTask, loadDockerElasticsearchVersion } from '../../../base-workspaces/internal/docker-dependencies.ts';
import type { Application as SpringDataRelationalApplication } from '../../../spring-data/generators/relational/types.d.ts';
import serverCommand from '../../command.ts';
import {
  addEntitiesOtherRelationships,
  getPrimaryKeyValue,
  hibernateSnakeCase,
  loadRequiredConfigDerivedProperties,
  prepareField as prepareServerFieldForTemplates,
  preparePostEntityServerDerivedProperties,
  prepareRelationship,
} from '../../support/index.ts';
import type {
  Application as ServerApplication,
  Entity as ServerEntity,
  Features as ServerFeatures,
  Options as ServerOptions,
} from '../../types.ts';

export default class ServerBootstrapGenerator extends BaseApplicationGenerator<ServerEntity, ServerApplication> {
  constructor(args?: string[], options?: ServerOptions, features?: ServerFeatures) {
    super(args, options, { loadCommand: [serverCommand], ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrap('common');
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeBackendType() {
        if (!this.jhipsterConfig.backendType || ['spring-boot', 'java'].includes(this.jhipsterConfig.backendType.toLowerCase())) {
          await this.composeWithJHipster('jhipster:spring-boot:bootstrap');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      cancel({ application }) {
        if (application.skipServer) {
          // TODO fix preparation for skipServer
          // this.cancelCancellableTasks();
        }
      },
      properties({ application }) {
        mutateData(application as unknown as SpringDataRelationalApplication, {
          devDatabaseTypeH2Any: ({ devDatabaseType }) => devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory',
          devJdbcUrl: undefined,
          devDatabaseUsername: undefined,
          devDatabasePassword: undefined,
          prodJdbcUrl: undefined,
          prodDatabaseUsername: undefined,
          prodDatabasePassword: undefined,
        });
      },
      async loadDockerDependencies({ application }) {
        loadDockerDependenciesTask.call(this, { context: application });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      checkSuffix({ application }) {
        if (application.entitySuffix === application.dtoSuffix) {
          throw new Error('Entities cannot be generated as the entity suffix and DTO suffix are equals!');
        }
      },
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          jhiTablePrefix: ({ jhiPrefix }) => hibernateSnakeCase(jhiPrefix),
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      async loadDockerDependencies({ application }) {
        // springBoot4 is prepared in preparing phase of spring-boot generator
        loadDockerElasticsearchVersion.call(this, {
          springBoot4: application.springBoot4,
          dockerContainers: application.dockerContainers!,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.postPreparing;
  }

  get loadingEntities() {
    return this.asLoadingEntitiesTaskGroup({
      loadingEntities({ entitiesToLoad }) {
        for (const { entityBootstrap } of entitiesToLoad) {
          loadRequiredConfigIntoEntity.call(
            this,
            entityBootstrap,
            this.jhipsterConfigWithDefaults as BaseApplicationApplication<BaseApplicationEntity>,
          );
        }
      },
      requiredOtherSideRelationships({ entitiesToLoad }) {
        this.validateResult(addEntitiesOtherRelationships(entitiesToLoad.map(({ entityBootstrap }) => entityBootstrap)));
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.loadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ application, entity }) {
        mutateData(entity, {
          __override__: false,
          entitySuffix: application.entitySuffix ?? '',
          dtoSuffix: application.dtoSuffix ?? 'DTO',
          entityClass: ({ entityNameCapitalized }) => upperFirst(entityNameCapitalized),
          entityClassPlural: ({ entityNamePlural }) => upperFirst(entityNamePlural),
          entityTableName: ({ entityNameCapitalized }) => hibernateSnakeCase(entityNameCapitalized),

          persistClass: ({ entityClass, entitySuffix }) => `${entityClass}${entitySuffix ?? ''}`,
          persistInstance: ({ entityInstance, entitySuffix }) => `${entityInstance}${entitySuffix ?? ''}`,
          // Even if dto is not used, we need to generate the dtoClass and dtoInstance is added to avoid errors in rendered relationships templates. The resulting class will not exist then.
          dtoClass: ({ entityClass, dtoSuffix }) => `${entityClass}${dtoSuffix ?? ''}`,
          dtoInstance: ({ entityInstance, dtoSuffix }) => `${entityInstance}${dtoSuffix ?? ''}`,

          dtoMapstruct: ({ dto }) => dto === 'mapstruct' || dto === 'any',
          dtoAny: ({ dto }) => dto && dto !== 'no',
          restClass: ({ dtoAny, dtoClass, persistClass }) => (dtoAny ? dtoClass! : persistClass!),
          restInstance: ({ dtoAny, dtoInstance, persistInstance }) => (dtoAny ? dtoInstance! : persistInstance!),
        });
        loadRequiredConfigDerivedProperties(entity);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldsForTemplates({ application, entity, field }) {
        if (application.databaseTypeAny) {
          prepareServerFieldForTemplates(application, entity, field, this);
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, entity, relationship }) {
        prepareRelationship({ application, entity, relationship });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareEntityDerivedProperties({ entity }) {
        preparePostEntityServerDerivedProperties(entity as any);
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      async postPreparingEntity({ application, entities }) {
        if (!application.backendTypeJavaAny) return;
        for (const entity of entities) {
          if (entity.primaryKey) {
            entity.resetFakerSeed!(`${application.baseName}post-prepare-server`);
            entity.primaryKey.javaSampleValues ??= [
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, 1),
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, 2),
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, entity.faker!.number.int({ min: 10, max: 100 })),
            ];
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

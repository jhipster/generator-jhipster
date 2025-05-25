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
import {
  filterEntitiesForClient,
  filterEntityPropertiesForClient,
  loadClientConfig,
  loadDerivedClientConfig,
  preparePostEntityClientDerivedProperties,
} from '../client/support/index.js';
import BaseApplicationGenerator, {
  type Entity as DeprecatedEntity,
  type Field as DeprecatedField,
  type Relationship as DeprecatedRelationship,
} from '../base-application/index.js';
import clientCommand from '../client/command.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/index.js';
import { getFrontendAppName } from '../base/support/index.js';
import type { BaseApplicationFeatures } from '../base-application/api.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type { BaseApplicationSources } from '../base-application/types.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { DeprecatedControl } from '../../lib/types/application/control.js';
import type { TaskTypes as DefaultTaskTypes } from '../base-application/tasks.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';

export default class BootStrapApplicationClient<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  // @ts-ignore
  Entity extends DeprecatedEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends ApplicationType<Field, PK, Relationship> = ApplicationType<Field, PK, Relationship>,
  Sources extends BaseApplicationSources<Field, PK, Relationship, Entity, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends DeprecatedControl = DeprecatedControl,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  Configuration extends ApplicationConfiguration = ApplicationConfiguration,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
> extends BaseApplicationGenerator<
  Options,
  Field,
  PK,
  Relationship,
  Entity,
  Application,
  Sources,
  Control,
  TaskTypes,
  Configuration,
  Features
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrapApplicationBase();
  }

  get loading() {
    return this.asLoadingTaskGroup({
      cancel({ application }) {
        if (application.skipClient) {
          this.cancelCancellableTasks();
        }
      },
      loadApplication({ application }) {
        loadConfig(clientCommand.configs, { config: this.jhipsterConfigWithDefaults, application });
        loadClientConfig({ config: this.jhipsterConfigWithDefaults, application });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ application }) {
        loadDerivedConfig(clientCommand.configs, { application });
        loadDerivedClientConfig({ application });
      },
      prepareForTemplates({ application }) {
        application.frontendAppName = getFrontendAppName({ baseName: application.baseName });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get default() {
    return this.asDefaultTaskGroup({
      addFallback({ application }) {
        application.filterEntitiesForClient ??= filterEntitiesForClient;
        application.filterEntityPropertiesForClient ??= filterEntityPropertiesForClient;
        application.filterEntitiesAndPropertiesForClient ??= entities => {
          entities = application.filterEntitiesForClient!(entities);
          entities.forEach(application.filterEntityPropertiesForClient!);
          return entities;
        };
      },
      async postPreparingEntity({ entities }) {
        for (const entity of entities) {
          await preparePostEntityClientDerivedProperties(entity);
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

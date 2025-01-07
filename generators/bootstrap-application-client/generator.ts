/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../base-application/index.js';
import { loadStoredAppOptions } from '../app/support/index.js';
import clientCommand from '../client/command.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/index.js';
import { getFrontendAppName } from '../base/support/index.js';

export default class BootStrapApplicationClient extends BaseApplicationGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, ...features });

    if (this.options.help) return;

    loadStoredAppOptions.call(this);
  }

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
      control({ control }) {
        control.filterEntitiesForClient ??= filterEntitiesForClient;
        control.filterEntityPropertiesForClient ??= filterEntityPropertiesForClient;
        control.filterEntitiesAndPropertiesForClient ??= entities => {
          entities = control.filterEntitiesForClient!(entities);
          entities.forEach(control.filterEntityPropertiesForClient!);
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

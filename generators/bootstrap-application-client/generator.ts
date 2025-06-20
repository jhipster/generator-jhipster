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
  preparePostEntityClientDerivedProperties,
} from '../client/support/index.js';
import { ClientApplicationGenerator } from '../client/generator.ts';
import clientCommand from '../client/command.js';
import { loadConfig, loadDerivedConfig } from '../base-core/internal/index.js';
import { getFrontendAppName } from '../../lib/utils/index.js';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, LOGIN_REGEX_JS } from '../generator-constants.js';

export default class BootStrapApplicationClient extends ClientApplicationGenerator {
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
      },
    });
  }

  get [ClientApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadDefaults({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          clientRootDir: '',
          clientDistDir: 'dist/',
          clientSrcDir: ({ clientRootDir }) => `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`,
          clientTestDir: ({ clientRootDir }) => `${clientRootDir}${clientRootDir ? 'test/' : CLIENT_TEST_SRC_DIR}`,
          frontendAppName: ({ baseName }) => getFrontendAppName({ baseName }),
          microfrontend: application => {
            if (application.applicationTypeMicroservice) {
              return application.clientFrameworkAny ?? false;
            }
            if (application.applicationTypeGateway) {
              return application.microfrontends && application.microfrontends.length > 0;
            }
            return false;
          },
          clientFrameworkBuiltIn: ({ clientFramework }) => ['angular', 'vue', 'react'].includes(clientFramework!),
          jsLoginRegex: LOGIN_REGEX_JS,
        });
      },
      prepareApplication({ application }) {
        loadDerivedConfig(clientCommand.configs, { application });
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
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

  get [ClientApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

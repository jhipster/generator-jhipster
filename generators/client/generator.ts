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
import { startCase } from 'lodash-es';

import BaseApplicationGenerator from '../base-application/index.js';

import { LOGIN_REGEX_JS } from '../generator-constants.js';
import { GENERATOR_CLIENT, GENERATOR_COMMON, GENERATOR_CYPRESS } from '../generator-list.js';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.js';
import { createNeedleCallback } from '../base-core/support/index.ts';
import { addEnumerationFiles } from './entity-files.js';
import { writeFiles as writeCommonFiles } from './files-common.js';
import { askForClientTheme, askForClientThemeVariant } from './prompts.js';
import { filterEntitiesAndPropertiesForClient } from './support/filter-entities.js';
import type {
  Application as ClientApplication,
  Config as ClientConfig,
  Entity as ClientEntity,
  Options as ClientOptions,
  Source as ClientSource,
} from './types.d.ts';

const { ANGULAR, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;
const { CYPRESS } = testFrameworkTypes;

export class ClientApplicationGenerator extends BaseApplicationGenerator<
  ClientEntity,
  ClientApplication<ClientEntity>,
  ClientConfig,
  ClientOptions,
  ClientSource
> {}

export default class ClientGenerator extends ClientApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster(GENERATOR_COMMON);
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForClientTheme,
      askForClientThemeVariant,
    });
  }

  get [ClientApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      applyNoFramework() {
        const { clientFramework } = this.jhipsterConfigWithDefaults;
        if (clientFramework === CLIENT_FRAMEWORK_NO) {
          this.jhipsterConfig.skipClient = true;
          this.cancelCancellableTasks();
        }
      },
      mergeTestConfig() {
        if (this.jhipsterConfig.clientTestFrameworks) {
          this.jhipsterConfig.testFrameworks = [
            ...new Set([...(this.jhipsterConfig.testFrameworks ?? []), ...this.jhipsterConfig.clientTestFrameworks]),
          ];
          delete this.jhipsterConfig.clientTestFrameworks;
        }
      },
      upgradeAngular() {
        if ((this.jhipsterConfig.clientFramework as string) === 'angularX') {
          this.jhipsterConfig.clientFramework = ANGULAR;
        }
      },

      configureDevServerPort() {
        if (this.jhipsterConfig.devServerPort !== undefined || this.jhipsterConfig.applicationIndex === undefined) return;

        const { applicationIndex, devServerPort } = this.jhipsterConfigWithDefaults;
        this.jhipsterConfig.devServerPort = devServerPort! + applicationIndex!;
      },
    });
  }

  get [ClientApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { clientFramework, testFrameworks } = this.jhipsterConfigWithDefaults;
        if (['angular', 'react', 'vue'].includes(clientFramework!)) {
          await this.composeWithJHipster(clientFramework!);
        }
        if (Array.isArray(testFrameworks) && testFrameworks.includes(CYPRESS)) {
          await this.composeWithJHipster(GENERATOR_CYPRESS);
        }
      },
    });
  }

  get [ClientApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadProperties({ applicationDefaults }) {
        // TODO v8 rename to nodePackageManager;
        applicationDefaults({
          clientPackageManager: 'npm',
          clientThemeNone: ({ clientTheme }) => !clientTheme || clientTheme === 'none',
          clientThemeAny: ({ clientThemeNone }) => !clientThemeNone,
        });
      },

      loadPackageJson({ application }) {
        // Load common client package.json into packageJson
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_CLIENT, 'resources', 'package.json'),
        );
      },
    });
  }

  get [ClientApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults({
          clientBundlerName: ctx => (ctx.clientBundlerExperimentalEsbuild ? 'esbuild' : startCase(ctx.clientBundler)),
          clientTestFramework: ctx => (ctx.clientFrameworkVue ? 'vitest' : 'jest'),
          clientTestFrameworkName: ctx => startCase(ctx.clientTestFramework),
        });
      },
      microservice({ application }) {
        if (application.applicationTypeMicroservice) {
          application.withAdminUi = false;
        }
      },

      prepareForTemplates({ application }) {
        application.webappLoginRegExp = LOGIN_REGEX_JS;
      },

      addExternalResource({ application, source }) {
        if (!application.clientFrameworkBuiltIn) {
          return;
        }
        source.addExternalResourceToRoot = ({ resource, comment }) =>
          this.editFile(
            `${application.clientSrcDir}index.html`,
            createNeedleCallback({
              needle: 'add-resources-to-root',
              contentToAdd: [comment ? `<!-- ${comment} -->` : undefined, resource].filter(i => i).join('\n'),
            }),
          );
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return {
      prepareEntity({ entity }) {
        if (entity.entityRestLayer === false) {
          entity.entityClientModelOnly = true;
        }
      },
    };
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        await control.cleanupFiles({
          '8.7.4': [`${application.clientSrcDir}swagger-ui/dist/images/throbber.gif`],
        });
      },
      webappFakeDataSeed({ application: { clientFramework } }) {
        this.resetEntitiesFakeData(clientFramework);
      },
      writeCommonFiles,
    });
  }

  get [ClientApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeEnumerationFiles({ application, entities }) {
        if (!application.webappEnumerationsDir || !application.clientFrameworkBuiltIn) {
          return;
        }
        for (const entity of (application.filterEntitiesAndPropertiesForClient ?? filterEntitiesAndPropertiesForClient)(entities)) {
          await addEnumerationFiles.call(this, { application, entity });
        }
      },
    });
  }

  get [ClientApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJsonScripts({ application }) {
        if (!application.clientFrameworkBuiltIn) {
          return;
        }
        const packageJsonStorage = this.createStorage(this.destinationPath(application.clientRootDir!, 'package.json'));
        const scriptsStorage = packageJsonStorage.createStorage('scripts');

        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('wait-on', application.nodeDependencies['wait-on']);
        devDependencies.set('concurrently', application.nodeDependencies.concurrently);

        if (application.clientFrameworkReact) {
          scriptsStorage.set('ci:frontend:test', 'npm run webapp:build:$npm_package_config_default_environment && npm run test');
        } else {
          scriptsStorage.set('ci:frontend:build', 'npm run webapp:build:$npm_package_config_default_environment');
          scriptsStorage.set('ci:frontend:test', 'npm run ci:frontend:build && npm test');
        }

        if (application.clientRootDir) {
          // Add scripts to map to client package.json
          this.packageJson.merge({
            scripts: {
              'webapp:build': `npm run -w ${application.clientRootDir} webapp:build`,
              'ci:frontend:test': `npm run -w ${application.clientRootDir} ci:frontend:test`,
            },
          });

          const clientWorkspace = application.clientRootDir.slice(0, -1);
          const packageJson = this.packageJson.createProxy();
          const workspaces = packageJson.workspaces as string[] | undefined;
          if (!workspaces?.includes(clientWorkspace)) {
            packageJson.workspaces = [...(workspaces ?? []), clientWorkspace];
          }
        }
      },

      microfrontend({ application, source }) {
        if (!application.microfrontend || !application.clientFrameworkBuiltIn || !application.clientBundlerWebpack) {
          return;
        }
        if (application.clientFrameworkAngular) {
          const conditional = application.applicationTypeMicroservice ? "targetOptions.target === 'serve' ? {} : " : '';
          source.addWebpackConfig!({
            config: `${conditional}require('./webpack.microfrontend')(config, options, targetOptions)`,
          });
        } else if (application.clientFrameworkVue || application.clientFrameworkReact) {
          source.addWebpackConfig!({ config: "require('./webpack.microfrontend')({ serve: options.env.WEBPACK_SERVE })" });
        } else {
          throw new Error(`Client framework ${application.clientFramework} doesn't support microfrontends`);
        }
      },
    });
  }

  get [ClientApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

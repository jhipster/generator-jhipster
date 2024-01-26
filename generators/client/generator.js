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

import BaseApplicationGenerator from '../base-application/index.js';

import { askForClientTheme, askForClientThemeVariant } from './prompts.js';
import { writeFiles as writeCommonFiles } from './files-common.js';

import { addEnumerationFiles } from './entity-files.js';

import { LOGIN_REGEX_JS } from '../generator-constants.js';
import statistics from '../statistics.js';
import { GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_CYPRESS, GENERATOR_COMMON, GENERATOR_CLIENT } from '../generator-list.js';

import { testFrameworkTypes, clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import { createNeedleCallback } from '../base/support/index.js';
import { loadStoredAppOptions } from '../app/support/index.js';
import command from './command.js';

const { ANGULAR, VUE, REACT, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;
const { CYPRESS } = testFrameworkTypes;

export default class JHipsterClientGenerator extends BaseApplicationGenerator {
  command = command;

  async beforeQueue() {
    loadStoredAppOptions.call(this);

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CLIENT);
    }

    if (!this.delegateToBlueprint) {
      // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
      await this.dependsOnJHipster(GENERATOR_COMMON);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterCommand(this.command);
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async prompting({ control }) {
        if (control.existingProject && this.options.askAnswered !== true) return;
        await this.prompt(this.prepareQuestions(this.command.configs));
      },
      askForClientTheme,
      askForClientThemeVariant,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup(this.delegateTasksToBlueprint(() => this.prompting));
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
        if (this.jhipsterConfig.clientFramework === 'angularX') {
          this.jhipsterConfig.clientFramework = ANGULAR;
        }
      },

      configureDevServerPort() {
        if (this.jhipsterConfig.devServerPort !== undefined) return;

        const { clientFramework, applicationIndex } = this.jhipsterConfigWithDefaults;
        const devServerBasePort = clientFramework === ANGULAR ? 4200 : 9060;
        let devServerPort;

        if (applicationIndex !== undefined) {
          devServerPort = devServerBasePort + applicationIndex;
        } else if (!devServerPort) {
          devServerPort = devServerBasePort;
        }

        this.jhipsterConfig.devServerPort = devServerPort;
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup(this.delegateTasksToBlueprint(() => this.configuring));
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { clientFramework, testFrameworks } = this.jhipsterConfigWithDefaults;
        if ([ANGULAR, VUE, REACT].includes(clientFramework)) {
          await this.composeWithJHipster(clientFramework);
        }
        if (Array.isArray(testFrameworks) && testFrameworks.includes(CYPRESS)) {
          await this.composeWithJHipster(GENERATOR_CYPRESS);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup(this.delegateTasksToBlueprint(() => this.composing));
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadSharedConfig({ application }) {
        // TODO v8 rename to nodePackageManager;
        application.clientPackageManager = 'npm';
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

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup(this.delegateTasksToBlueprint(() => this.loading));
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return this.asPreparingTaskGroup({
      microservice({ application }) {
        if (application.applicationTypeMicroservice) {
          application.withAdminUi = false;
        }
      },

      prepareForTemplates({ application }) {
        application.webappLoginRegExp = LOGIN_REGEX_JS;
      },

      addExternalResource({ application, source }) {
        if (![ANGULAR, VUE, REACT].includes(application.clientFramework)) {
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

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateTasksToBlueprint(() => this.preparing));
  }

  get default() {
    return this.asDefaultTaskGroup({
      insight({ application }) {
        statistics.sendSubGenEvent('generator', GENERATOR_CLIENT, {
          app: {
            clientFramework: application.clientFramework,
            enableTranslation: application.enableTranslation,
            nativeLanguage: application.nativeLanguage,
            languages: application.languages,
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup(this.delegateTasksToBlueprint(() => this.default));
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      webappFakeDataSeed({ application: { clientFramework } }) {
        this.resetEntitiesFakeData(clientFramework);
      },
      writeCommonFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup(this.delegateTasksToBlueprint(() => this.writing));
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeEnumerationFiles({ application, entities }) {
        if (!application.webappEnumerationsDir || ![ANGULAR, VUE, REACT].includes(application.clientFramework)) {
          return;
        }
        for (const entity of entities.filter(entity => !entity.skipClient)) {
          await addEnumerationFiles.call(this, { application, entity });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup(this.delegateTasksToBlueprint(() => this.writingEntities));
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJsonScripts({ application }) {
        if (![ANGULAR, VUE, REACT].includes(application.clientFramework)) {
          return;
        }
        const packageJsonStorage = this.createStorage(this.destinationPath(application.clientRootDir, 'package.json'));
        const scriptsStorage = packageJsonStorage.createStorage('scripts');

        const packageJsonConfigStorage = packageJsonStorage.createStorage('config').createProxy();
        if (process.env.JHI_PROFILE) {
          packageJsonConfigStorage.default_environment = process.env.JHI_PROFILE.includes('dev') ? 'dev' : 'prod';
        }

        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('wait-on', application.nodeDependencies['wait-on']);
        devDependencies.set('concurrently', application.nodeDependencies.concurrently);

        if (application.clientFrameworkReact) {
          scriptsStorage.set('ci:frontend:test', 'npm run webapp:build:$npm_package_config_default_environment && npm run test-ci');
        } else {
          scriptsStorage.set('ci:frontend:build', 'npm run webapp:build:$npm_package_config_default_environment');
          scriptsStorage.set('ci:frontend:test', 'npm run ci:frontend:build && npm test');
        }
      },

      microfrontend({ application, source }) {
        if (!application.microfrontend || ![ANGULAR, VUE, REACT].includes(application.clientFramework)) {
          return;
        }
        if (application.clientFrameworkAngular) {
          const conditional = application.applicationTypeMicroservice ? "targetOptions.target === 'serve' ? {} : " : '';
          source.addWebpackConfig({
            config: `${conditional}require('./webpack.microfrontend')(config, options, targetOptions)`,
          });
        } else if (application.clientFrameworkVue || application.clientFrameworkReact) {
          source.addWebpackConfig({ config: "require('./webpack.microfrontend')({ serve: options.env.WEBPACK_SERVE })" });
        } else {
          throw new Error(`Client framework ${application.clientFramework} doesn't support microfrontends`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}

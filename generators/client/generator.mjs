/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
/* eslint-disable consistent-return */
import chalk from 'chalk';
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';

import { askForAdminUi, askForClient, askForClientTheme, askForClientThemeVariant } from './prompts.mjs';
import { writeFiles as writeCommonFiles } from './files-common.mjs';

import { writeEnumerationFiles } from './entity-files.mjs';

import { LOGIN_REGEX_JS } from '../generator-constants.mjs';
import statistics from '../statistics.cjs';
import { GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_CYPRESS, GENERATOR_COMMON, GENERATOR_CLIENT } from '../generator-list.mjs';

import { testFrameworkTypes, clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const { ANGULAR, VUE, REACT } = clientFrameworkTypes;
const { CYPRESS } = testFrameworkTypes;

/**
 * @class
 * @extends {BaseApplicationGenerator<import('./types.mjs').ClientApplication>}
 */
export default class JHipsterClientGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    // This adds support for a `--auth` flag
    this.option('auth', {
      desc: 'Provide authentication type for the application',
      type: String,
    });

    // This adds support for a `--skip-commit-hook` flag
    this.option('skip-commit-hook', {
      desc: 'Skip adding husky commit hooks',
      type: Boolean,
    });

    // This adds support for a `--experimental` flag which can be used to enable experimental features
    this.option('experimental', {
      desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  async beforeQueue() {
    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CLIENT);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup(this.delegateTasksToBlueprint(() => this.initializing));
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForClient,
      askForAdminUi,
      askForClientTheme,
      askForClientThemeVariant,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup(this.delegateTasksToBlueprint(() => this.prompting));
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      upgradeAngular() {
        if (this.jhipsterConfig.clientFramework === 'angularX') {
          this.jhipsterConfig.clientFramework = ANGULAR;
        }
      },

      configureDevServerPort() {
        if (this.jhipsterConfig.devServerPort !== undefined) return undefined;

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
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON);
      },
      async composing() {
        const { clientFramework, testFrameworks, enableTranslation } = this.jhipsterConfigWithDefaults;
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

      loadPackageJson() {
        // Load common client package.json into packageJson
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_CLIENT, 'templates', 'package.json'))
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
      writeEnumerationFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup(this.delegateTasksToBlueprint(() => this.writingEntities));
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJsonScripts({ application }) {
        const packageJsonStorage = this.createStorage('package.json');
        const scriptsStorage = packageJsonStorage.createStorage('scripts');

        const packageJsonConfigStorage = packageJsonStorage.createStorage('config').createProxy();
        if (process.env.JHI_PROFILE) {
          packageJsonConfigStorage.default_environment = process.env.JHI_PROFILE.includes('dev') ? 'dev' : 'prod';
        }

        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('wait-on', this.dependabotPackageJson.devDependencies['wait-on']);
        devDependencies.set('concurrently', this.dependabotPackageJson.devDependencies.concurrently);

        if (application.clientFrameworkReact) {
          scriptsStorage.set('ci:frontend:test', 'npm run webapp:build:$npm_package_config_default_environment && npm run test-ci');
        } else {
          scriptsStorage.set('ci:frontend:build', 'npm run webapp:build:$npm_package_config_default_environment');
          scriptsStorage.set('ci:frontend:test', 'npm run ci:frontend:build && npm test');
        }
      },

      microfrontend({ application }) {
        if (!application.microfrontend) return;
        if (application.clientFrameworkAngular) {
          const conditional = application.applicationTypeMicroservice ? "targetOptions.target === 'serve' ? {} : " : '';
          this.addWebpackConfig(
            `${conditional}require('./webpack.microfrontend')(config, options, targetOptions)`,
            application.clientFramework
          );
        } else if (application.clientFrameworkVue || application.clientFrameworkReact) {
          this.addWebpackConfig("require('./webpack.microfrontend')({ serve: options.env.WEBPACK_SERVE })", application.clientFramework);
        } else {
          throw new Error(`Client framework ${application.clientFramework} doesn't support microfrontends`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }

  // Public API method used by the getter and also by Blueprints
  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log(chalk.green.bold('\nClient application generated successfully.\n'));

        const logMsg = `Start your Webpack development server with:\n ${chalk.yellow.bold(`${application.clientPackageManager} start`)}\n`;

        this.log(chalk.green(logMsg));
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup(this.delegateTasksToBlueprint(() => this.end));
  }
}

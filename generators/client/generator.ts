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

import { LOGIN_REGEX_JS } from '../generator-constants.js';
import { GENERATOR_CLIENT, GENERATOR_COMMON, GENERATOR_CYPRESS } from '../generator-list.js';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.js';
import { createNeedleCallback } from '../base/support/index.js';
import { loadStoredAppOptions } from '../app/support/index.js';
import { addEnumerationFiles } from './entity-files.js';
import { writeFiles as writeCommonFiles } from './files-common.js';
import { askForClientTheme, askForClientThemeVariant } from './prompts.js';

const { ANGULAR, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;
const { CYPRESS } = testFrameworkTypes;

export default class JHipsterClientGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    loadStoredAppOptions.call(this);

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

  get [BaseApplicationGenerator.PROMPTING]() {
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
        // @ts-ignore deprecated value
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

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadSharedConfig({ application }) {
        // TODO v8 rename to nodePackageManager;
        (application as any).clientPackageManager = 'npm';
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
    return this.delegateTasksToBlueprint(() => this.loading);
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

  get [BaseApplicationGenerator.PREPARING]() {
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

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
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
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeEnumerationFiles({ control, application, entities }) {
        if (!application.webappEnumerationsDir || !application.clientFrameworkBuiltIn) {
          return;
        }
        for (const entity of (control.filterEntitiesAndPropertiesForClient ?? (entities => entities))(entities)) {
          await addEnumerationFiles.call(this, { application, entity });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
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
          scriptsStorage.set('ci:frontend:test', 'npm run webapp:build:$npm_package_config_default_environment && npm run test-ci');
        } else {
          scriptsStorage.set('ci:frontend:build', 'npm run webapp:build:$npm_package_config_default_environment');
          scriptsStorage.set('ci:frontend:test', 'npm run ci:frontend:build && npm test');
        }

        if (application.clientRootDir) {
          // Add scripts to map to client package.json
          this.packageJson.merge({
            workspaces: [application.clientRootDir],
            scripts: {
              'webapp:build': `npm run -w ${application.clientRootDir} webapp:build`,
              'ci:frontend:test': `npm run -w ${application.clientRootDir} ci:frontend:test`,
              'e2e:headless': `npm run -w ${application.clientRootDir} e2e:headless`,
            },
          });
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

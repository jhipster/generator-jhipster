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

import fs from 'fs';
import path from 'path';

import { GENERATOR_ANGULAR, GENERATOR_COMMON, GENERATOR_GIT, GENERATOR_WORKSPACES } from '../generator-list.mjs';

import { GENERATOR_JHIPSTER } from '../generator-constants.mjs';
import BaseGenerator from '../base/index.mjs';
import { getConfigWithDefaults } from '../../jdl/jhipster/index.mjs';
import { removeFieldsWithNullishValues } from '../base/support/config.mjs';
import command from './command.mjs';

/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @extends {BaseGenerator}
 */
export default class WorkspacesGenerator extends BaseGenerator {
  workspacesFolders;
  workspaces;
  generateApplications;
  generateWith;

  generateWorkspaces;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_WORKSPACES);
    }

    this.loadRuntimeOptions();
  }

  get initializing() {
    return {
      loadConfig() {
        this.parseJHipsterOptions(command.options);

        // Generate workspaces file only when option passed or regenerating
        this.generateWorkspaces = this.workspaces !== false || !!this.packageJson.get('workspaces');

        // When generating workspaces, save to .yo-rc.json. Use a dummy config otherwise.
        this.workspacesConfig = this.generateWorkspaces ? this.jhipsterConfig : {};
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return {
      async configure() {
        this.jhipsterConfig.baseName = this.jhipsterConfig.baseName || 'workspaces';
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return {
      async composeGit() {
        if (this.options.monorepository || this.jhipsterConfig.monorepository) {
          await this.composeWithJHipster(GENERATOR_GIT);
        }
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get default() {
    return {
      async generateApplications() {
        if (!this.generateApplications) {
          return;
        }

        if (typeof this.generateApplications === 'function') {
          await this.generateApplications.call(this);
        } else {
          for (const appName of this.workspacesFolders) {
            await this.composeWithJHipster(this.generateWith, { generatorOptions: { destinationRoot: this.destinationPath(appName) } });
          }
        }
      },
      async configureUsingFiles() {
        if (!this.generateWorkspaces) return;

        const packages = [...(this.workspacesConfig.packages ?? [])];
        this.workspacesFolders.forEach(workspace => !packages.includes(workspace) && packages.push(workspace));
        let dockerCompose;

        const dir = fs.opendirSync('./');
        let dirent = await dir.read();
        while (dirent) {
          if (dirent.isDirectory()) {
            if (dirent.name === 'docker-compose') {
              dockerCompose = true;
            } else if (fs.existsSync(path.join(dir.path, dirent.name, 'package.json'))) {
              if (!packages.includes(dirent.name)) {
                packages.push(dirent.name);
              }
            }
          }
          dirent = await dir.read();
        }
        dir.closeSync();

        this.workspacesConfig.dockerCompose = dockerCompose;
        this.workspacesConfig.packages = packages;
      },

      configurePackageManager() {
        if (this.workspacesConfig.clientPackageManager || !this.generateWorkspaces) return;

        this.workspacesConfig.clientPackageManager = this._detectNodePackageManager();
      },

      async loadConfig() {
        if (!this.generateWorkspaces) return;

        this.dockerCompose = this.workspacesConfig.dockerCompose;
        this.packages = this.workspacesConfig.packages;
        this.env.options.nodePackageManager = this.workspacesConfig.clientPackageManager;
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get postWriting() {
    return {
      generatePackageJson() {
        if (!this.generateWorkspaces) return;

        const {
          dependencies: { rxjs },
          devDependencies: { webpack: webpackVersion },
        } = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'resources', 'package.json'));

        const {
          devDependencies: { concurrently },
        } = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'resources', 'package.json'));

        this.packageJson.merge({
          workspaces: {
            packages: this.packages,
          },
          devDependencies: {
            concurrently,
          },
          scripts: {
            'ci:e2e:package': 'npm run ci:docker:build --workspaces --if-present && npm run java:docker --workspaces --if-present',
            'ci:e2e:run': 'npm run e2e:headless --workspaces --if-present',
            ...this._getOtherScripts(),
            ...this._createConcurrentlyScript('watch', 'backend:build-cache', 'java:docker', 'java:docker:arm64'),
            ...this._createWorkspacesScript('ci:backend:test', 'ci:frontend:test', 'webapp:test'),
          },
        });

        const applications = this.loadApplications();
        if (applications.some(app => app.clientFrameworkAngular)) {
          this.packageJson.merge({
            devDependencies: {
              rxjs, // Set version to workaround https://github.com/npm/cli/issues/4437
            },
            overrides: {
              webpack: webpackVersion,
            },
          });
        }
        if (applications.some(app => app.clientFrameworkVue)) {
          this.packageJson.merge({
            // https://github.com/vuejs/vue-jest/issues/480#issuecomment-1330479635
            overrides: {
              '@babel/core': '7.17.9',
              '@babel/generator': '7.17.9',
              'istanbul-lib-instrument': '5.2.0',
            },
          });
        }
      },
    };
  }

  get [BaseGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  _detectNodePackageManager() {
    if (this.options.clientPackageManager !== undefined) {
      return this.options.clientPackageManager;
    }

    if (this.workspacesConfig.packages && this.workspacesConfig.packages.length > 0) {
      const appPackageJson = this.readDestinationJSON(`${this.workspacesConfig.packages[0]}/.yo-rc.json`);
      const nodePackageManager =
        appPackageJson && appPackageJson[GENERATOR_JHIPSTER] && appPackageJson[GENERATOR_JHIPSTER].clientPackageManager;
      if (nodePackageManager) {
        return nodePackageManager;
      }
    }

    return 'npm';
  }

  _getOtherScripts() {
    if (this.dockerCompose) {
      return {
        'docker-compose': 'docker compose -f docker-compose/docker-compose.yml up --wait',
        'ci:e2e:prepare': 'npm run docker-compose',
        'ci:e2e:teardown': 'docker compose -f docker-compose/docker-compose.yml down -v',
      };
    }
    return {};
  }

  _createConcurrentlyScript(...scripts) {
    const scriptsList = scripts
      .map(script => {
        const packageScripts = this.packages.map(packageName => [
          `${script}:${packageName}`,
          `npm run ${script} --workspace ${packageName} --if-present`,
        ]);
        packageScripts.push([script, `concurrently ${this.packages.map(packageName => `npm:${script}:${packageName}`).join(' ')}`]);
        return packageScripts;
      })
      .flat();
    return Object.fromEntries(scriptsList);
  }

  _createWorkspacesScript(...scripts) {
    return Object.fromEntries(scripts.map(script => [`${script}`, `npm run ${script} --workspaces --if-present`]));
  }

  loadApplications() {
    return this.workspacesConfig.packages
      .map(appPath => {
        const appConfig = this.readDestinationJSON(`${appPath}/.yo-rc.json`)[GENERATOR_JHIPSTER];
        if (!appConfig) return undefined;

        const app = getConfigWithDefaults(removeFieldsWithNullishValues(appConfig));

        this.loadAppConfig(app, app);
        this.loadServerConfig(app, app);
        this.loadClientConfig(app, app);
        this.loadPlatformConfig(app, app);

        this.loadDerivedAppConfig(app);
        this.loadDerivedClientConfig(app);
        this.loadDerivedServerConfig(app);
        this.loadDerivedPlatformConfig(app);
        return app;
      })
      .filter(app => app);
  }
}

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

import { existsSync } from 'fs';

import { GENERATOR_ANGULAR, GENERATOR_BOOTSTRAP_WORKSPACES, GENERATOR_GIT, GENERATOR_WORKSPACES } from '../generator-list.js';

import BaseWorkspacesGenerator from '../base-workspaces/index.js';
import command from './command.js';

/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @extends {BaseWorkspacesGenerator}
 */
export default class WorkspacesGenerator extends BaseWorkspacesGenerator {
  workspaces;
  generateApplications;
  generateWith;

  generateWorkspaces;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_WORKSPACES);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_WORKSPACES, { generatorOptions: { customWorkspacesConfig: true } });
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadConfig() {
        this.parseJHipsterOptions(command.options);

        // Generate workspaces file only when option passed or regenerating
        this.generateWorkspaces = this.workspaces !== false || !!this.packageJson?.get('workspaces');

        // When generating workspaces, save to .yo-rc.json. Use a dummy config otherwise.
        this.workspacesConfig = this.generateWorkspaces ? this.jhipsterConfig : {};
      },
    });
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      async configure() {
        this.jhipsterConfig.baseName = this.jhipsterConfig.baseName || 'workspaces';
      },
      async configureUsingFiles() {
        if (!this.generateWorkspaces) return;

        if (existsSync(this.destinationPath('docker-compose'))) {
          this.workspacesConfig.dockerCompose = true;
        }
        this.workspacesConfig.appsFolders = [...new Set([...(this.workspacesConfig.packages ?? []), ...this.appsFolders])];
        delete this.workspacesConfig.packages;
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeGit() {
        if (this.options.monorepository || this.jhipsterConfig.monorepository) {
          await this.composeWithJHipster(GENERATOR_GIT);
        }
      },
      async generateApplications() {
        if (!this.generateApplications) {
          return;
        }

        if (typeof this.generateApplications === 'function') {
          await this.generateApplications.call(this);
        } else {
          for (const appName of this.appsFolders) {
            await this.composeWithJHipster(this.generateWith, { generatorOptions: { destinationRoot: this.destinationPath(appName) } });
          }
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loadingWorkspaces() {
    return this.asDefaultTaskGroup({
      configurePackageManager({ applications }) {
        if (this.workspacesConfig.clientPackageManager || !this.generateWorkspaces) return;

        this.workspacesConfig.clientPackageManager =
          this.options.clientPackageManager ?? applications.find(app => app.clientPackageManager)?.clientPackageManager ?? 'npm';
      },
      async loadConfig() {
        if (!this.generateWorkspaces) return;

        this.dockerCompose = this.workspacesConfig.dockerCompose;
        this.env.options.nodePackageManager = this.workspacesConfig.clientPackageManager;
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      generatePackageJson({ applications }) {
        if (!this.generateWorkspaces) return;

        const findDependencyVersion = dependency =>
          applications.find(app => app.nodeDependencies[dependency])?.nodeDependencies[dependency];
        this.packageJson.merge({
          workspaces: {
            packages: this.appsFolders,
          },
          devDependencies: {
            concurrently: findDependencyVersion('concurrently'),
          },
          scripts: {
            'ci:e2e:package': 'npm run ci:docker:build --workspaces --if-present && npm run java:docker --workspaces --if-present',
            'ci:e2e:run': 'npm run e2e:headless --workspaces --if-present',
            ...this.getOtherScripts(),
            ...this.createConcurrentlyScript('watch', 'backend:build-cache', 'java:docker', 'java:docker:arm64'),
            ...this.createWorkspacesScript('ci:backend:test', 'ci:frontend:test', 'webapp:test'),
          },
        });

        if (applications.some(app => app.clientFrameworkAngular)) {
          const {
            dependencies: { rxjs },
            devDependencies: { webpack: webpackVersion },
          } = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'resources', 'package.json'));

          this.packageJson.merge({
            devDependencies: {
              rxjs, // Set version to workaround https://github.com/npm/cli/issues/4437
            },
            overrides: {
              webpack: webpackVersion,
            },
          });
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  getOtherScripts() {
    if (this.dockerCompose) {
      return {
        'docker-compose': 'docker compose -f docker-compose/docker-compose.yml up --wait',
        'ci:e2e:prepare': 'npm run docker-compose',
        'ci:e2e:teardown': 'docker compose -f docker-compose/docker-compose.yml down -v',
      };
    }
    return {};
  }

  createConcurrentlyScript(...scripts) {
    const scriptsList = scripts
      .map(script => {
        const packageScripts = this.appsFolders.map(packageName => [
          `${script}:${packageName}`,
          `npm run ${script} --workspace ${packageName} --if-present`,
        ]);
        packageScripts.push([script, `concurrently ${this.appsFolders.map(packageName => `npm:${script}:${packageName}`).join(' ')}`]);
        return packageScripts;
      })
      .flat();
    return Object.fromEntries(scriptsList);
  }

  createWorkspacesScript(...scripts) {
    return Object.fromEntries(scripts.map(script => [`${script}`, `npm run ${script} --workspaces --if-present`]));
  }
}

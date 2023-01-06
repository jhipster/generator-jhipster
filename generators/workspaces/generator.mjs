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

import { GENERATOR_ANGULAR, GENERATOR_APP, GENERATOR_COMMON, GENERATOR_GIT } from '../generator-list.mjs';

import { GENERATOR_JHIPSTER } from '../generator-constants.mjs';
import BaseGenerator from '../base/index.mjs';
import { deploymentOptions } from '../../jdl/jhipster/index.mjs';

const {
  DeploymentTypes: { DOCKERCOMPOSE },
} = deploymentOptions;
/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @extends {BaseGenerator}
 */
export default class WorkspacesGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('workspaces', {
      desc: 'Generate workspaces for multiples applications',
      type: Boolean,
    });

    this.option('monorepository', {
      desc: 'Use monorepository',
      type: Boolean,
    });

    if (this.options.help) return;

    // Generate workspaces file only when option passed or regenerating
    this.generateWorkspaces = this.options.workspaces !== false || !!this.packageJson.get('workspaces');

    // When generating workspaces, save to .yo-rc.json. Use a dummy config otherwise.
    this.workspacesConfig = this.generateWorkspaces ? this.jhipsterConfig : {};
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('workspaces');
    }

    this.loadRuntimeOptions();
  }

  get configuring() {
    return {
      async configure() {
        this.jhipsterConfig.baseName = this.jhipsterConfig.baseName || 'workspaces';
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    if (this.delegateToBlueprint) return {};
    return this.configuring;
  }

  get composing() {
    return {
      async composeGit() {
        if (this.options.monorepository) {
          await this.composeWithJHipster(GENERATOR_GIT);
        }
      },
      async generateJdl() {
        const { generateJdl } = this.options;
        if (generateJdl) {
          await generateJdl();
        }
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get default() {
    return {
      async configureUsingImportState() {
        const importState = this.options.importState;
        if (!importState || !this.generateWorkspaces) return;

        const applications = Object.entries(importState.exportedApplicationsWithEntities ?? {});
        let clientPackageManager;
        if (applications.length > 0) {
          clientPackageManager = applications[0][1].config.clientPackageManager;
          const { generateWith = GENERATOR_APP, generateApplications } = this.options;
          if (this.options.generateApplications) {
            for (const [appName, applicationWithEntities] of applications) {
              await this.composeWithJHipster(generateWith, { destinationRoot: this.destinationPath(appName), applicationWithEntities });
            }
          }
        }
        this.workspacesConfig.clientPackageManager = clientPackageManager || 'npm';
        const dockerCompose = importState.exportedDeployments?.some(
          deployment => deployment[GENERATOR_JHIPSTER].deploymentType === DOCKERCOMPOSE
        );

        this.workspacesConfig.dockerCompose = dockerCompose;
        this.workspacesConfig.packages = applications.map(([appName]) => appName);
      },

      async configureUsingFiles() {
        if (this.options.importState || !this.generateWorkspaces) return;

        const packages = this.workspacesConfig.packages || [];
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
        } = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'templates', 'package.json'));

        const {
          devDependencies: { concurrently },
        } = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'templates', 'package.json'));

        this.packageJson.merge({
          workspaces: {
            packages: this.packages,
          },
          devDependencies: {
            rxjs, // Set version to workaround https://github.com/npm/cli/issues/4437
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
}

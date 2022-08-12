/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

const fs = require('fs');
const path = require('path');

const { INITIALIZING_PRIORITY, CONFIGURING_PRIORITY, LOADING_PRIORITY, WRITING_PRIORITY, POST_WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;

const { GENERATOR_JHIPSTER } = require('../generator-constants');
const {
  DeploymentTypes: { DOCKERCOMPOSE },
} = require('../../jdl/jhipster/deployment-options');
const BaseBlueprintGenerator = require('../generator-base-blueprint');

module.exports = class extends BaseBlueprintGenerator {
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

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('workspaces');
    }

    this.loadRuntimeOptions();
  }

  _initializing() {
    return {
      initializeGit() {
        if (!this.options.monorepository) return;
        this.checkGit();
        this.initializeGitRepository();
      },

      generateJdl() {
        const { generateJdl } = this.options;
        return generateJdl();
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  _configuring() {
    return {
      async configureUsingImportState() {
        const importState = this.options.importState;
        if (!importState || !this.generateWorkspaces) return;

        const applications = importState.exportedApplicationsWithEntities;
        const packages = Object.keys(applications);
        const clientPackageManager = applications[packages[0]].config.clientPackageManager;
        const dockerCompose = importState.exportedDeployments.some(
          deployment => deployment[GENERATOR_JHIPSTER].deploymentType === DOCKERCOMPOSE
        );

        this.workspacesConfig.dockerCompose = dockerCompose;
        this.workspacesConfig.packages = packages;
        this.workspacesConfig.clientPackageManager = clientPackageManager;
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
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  _loading() {
    return {
      async loadConfig() {
        if (!this.generateWorkspaces) return;

        this.dockerCompose = this.workspacesConfig.dockerCompose;
        this.packages = this.workspacesConfig.packages;
        this.env.options.nodePackageManager = this.workspacesConfig.clientPackageManager;
      },
      loadDependabotPackageJson() {
        if (!this.generateWorkspaces) return;

        this._.merge(this.dependabotPackageJson, this.fs.readJSON(this.fetchFromInstalledJHipster('common', 'templates', 'package.json')));
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  _writing() {
    return {
      async writeTemplates() {
        if (!this.generateWorkspaces) return;
        await this.writeFilesToDisk(
          {
            base: [
              {
                templates: ['.gitignore'],
              },
            ],
          },
          this,
          false,
          this.fetchFromInstalledJHipster('workspaces/templates')
        );
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  _postWriting() {
    return {
      generatePackageJson() {
        if (!this.generateWorkspaces) return;

        const {
          dependencies: { rxjs },
        } = this.fs.readJSON(this.fetchFromInstalledJHipster('client', 'templates', 'angular', 'package.json'));

        this.packageJson.merge({
          workspaces: {
            packages: this.packages,
          },
          devDependencies: {
            rxjs, // Set version to workaround https://github.com/npm/cli/issues/4437
            concurrently: this.dependabotPackageJson.devDependencies.concurrently,
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

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
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
        'docker-compose': 'docker-compose -f docker-compose/docker-compose.yml up -d',
        'ci:e2e:prepare': 'npm run docker-compose',
        'ci:e2e:teardown': 'docker-compose -f docker-compose/docker-compose.yml down -v',
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
};

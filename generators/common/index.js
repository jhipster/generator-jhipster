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
/* eslint-disable consistent-return */
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  CONFIGURING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const writeFiles = require('./files').writeFiles;
const prettierConfigFiles = require('./files').prettierConfigFiles;
const constants = require('../generator-constants');
const packageJson = require('../../package.json');

module.exports = class JHipsterCommonGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('common');
    }
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      setupConstants() {
        // Make constants available in templates
        this.MAIN_DIR = constants.MAIN_DIR;
        this.TEST_DIR = constants.TEST_DIR;
        this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        this.REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

        // Make documentation URL available in templates
        this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
        this.DOCUMENTATION_ARCHIVE_PATH = constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      async configureMonorepository() {
        if (this.jhipsterConfig.monorepository) return;

        const git = this.createGit();
        if ((await git.checkIsRepo()) && !(await git.checkIsRepo('root'))) {
          this.jhipsterConfig.monorepository = true;
        }
      },
      configureCommitHook() {
        if (this.jhipsterConfig.monorepository) {
          this.jhipsterConfig.skipCommitHook = true;
        }
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this.loadPlatformConfig();
      },

      loadPackageJson() {
        // The installed prettier version should be the same that the one used during JHipster generation to avoid formatting differences
        _.merge(this.dependabotPackageJson, {
          devDependencies: {
            prettier: packageJson.dependencies.prettier,
            'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
            'prettier-plugin-packagejson': packageJson.dependencies['prettier-plugin-packagejson'],
          },
        });

        // Load common package.json into packageJson
        _.merge(this.dependabotPackageJson, this.fs.readJSON(this.fetchFromInstalledJHipster('common', 'templates', 'package.json')));
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _preparing() {
    return {
      prepareForTemplates() {
        this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
        this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.buildTool) + constants.CLIENT_DIST_DIR;
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.1.1')) {
          if (!this.skipCommitHook) {
            this.removeFile('.huskyrc');
          }
        }
        if (this.isJhipsterVersionLessThan('7.6.1')) {
          if (this.skipClient) {
            this.removeFile('npmw');
            this.removeFile('npmw.cmd');
          }
        }
      },
      writePrettierConfig() {
        // Prettier configuration needs to be the first written files - all subgenerators considered - for prettier transform to work
        return this.writeFilesToDisk(prettierConfigFiles);
      },
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  _postWriting() {
    return {
      addCommitHookDependencies() {
        if (this.skipCommitHook) return;
        this.packageJson.merge({
          scripts: {
            prepare: 'husky install',
          },
          devDependencies: {
            husky: this.dependabotPackageJson.devDependencies.husky,
            'lint-staged': this.dependabotPackageJson.devDependencies['lint-staged'],
          },
        });
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }
};

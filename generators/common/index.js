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

const BaseApplicationGenerator = require('../base-application/generator.cjs');

const writeFiles = require('./files').writeFiles;
const prettierConfigFiles = require('./files').prettierConfigFiles;
const constants = require('../generator-constants');
const { packageJson } = require('../../lib/index.js');
const { GENERATOR_COMMON, GENERATOR_BOOTSTRAP_APPLICATION } = require('../generator-list');

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../bootstrap-application-base/types').CommonClientServerApplication>}
 */
module.exports = class CommonGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    this.jhipsterOptions({
      prettierTabWidth: {
        desc: 'Default tab width for prettier',
        type: Number,
        scope: 'storage',
      },
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_COMMON);
    }
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
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

  get [BaseApplicationGenerator.CONFIGURING]() {
    if (this.delegateToBlueprint) return {};
    return this.configuring;
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
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

      loadConfig({ application }) {
        application.prettierTabWidth = this.jhipsterConfig.prettierTabWidth || 2;
      },
    };
  }

  get [BaseApplicationGenerator.LOADING]() {
    if (this.delegateToBlueprint) return {};
    return this.loading;
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return {
      prepareForTemplates({ application }) {
        application.BUILD_DIR = this.getBuildDirectoryForBuildTool(application.buildTool);
        application.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(application.buildTool) + constants.CLIENT_DIST_DIR;
      },

      setupConstants({ application }) {
        // Make constants available in templates
        application.MAIN_DIR = constants.MAIN_DIR;
        application.TEST_DIR = constants.TEST_DIR;
        application.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        application.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        application.REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

        // Make documentation URL available in templates
        application.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
        application.DOCUMENTATION_ARCHIVE_PATH = constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;
      },
    };
  }

  get [BaseApplicationGenerator.PREPARING]() {
    if (this.delegateToBlueprint) return {};
    return this.preparing;
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      cleanup({ application }) {
        if (this.isJhipsterVersionLessThan('7.1.1')) {
          if (!application.skipCommitHook) {
            this.removeFile('.huskyrc');
          }
        }
        if (this.isJhipsterVersionLessThan('7.6.1')) {
          if (application.skipClient) {
            this.removeFile('npmw');
            this.removeFile('npmw.cmd');
          }
        }
      },
      writePrettierConfig({ application }) {
        return this.writeFiles({
          sections: prettierConfigFiles,
          context: application,
        });
      },
      ...writeFiles(),
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    if (this.delegateToBlueprint) return {};
    return this.writing;
  }

  get postWriting() {
    return {
      addCommitHookDependencies({ application }) {
        if (application.skipCommitHook) return;
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    if (this.delegateToBlueprint) return {};
    return this.postWriting;
  }
};

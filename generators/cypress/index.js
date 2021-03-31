/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const writeFiles = require('./files').writeFiles;
const constants = require('../generator-constants');
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    if (this.options.help) {
      return;
    }

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('cypress');
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  _prompting() {
    return {
      async askForCypressCoverage() {
        if (
          this.options.existingProject ||
          this.jhipsterConfig.clientFramework !== constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR ||
          !this.jhipsterConfig.testFrameworks.includes(CYPRESS)
        ) {
          return;
        }
        const answers = await this.prompt({
          type: 'confirm',
          name: 'cypressCoverage',
          message: 'Would you like to generate code coverage for Cypress tests? [Experimental]',
          default: this.jhipsterConfig.cypressCoverage || false,
        });

        this.cypressCoverage = this.jhipsterConfig.cypressCoverage = answers.cypressCoverage;
      },
    };
  }

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
      },
    };
  }

  get loading() {
    if (useBlueprints) return;
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

  get preparing() {
    if (useBlueprints) return;
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return super._missingPreDefault();
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1') && this.jhipsterConfig.cypressTests) {
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/support/keycloak-oauth2.ts`);
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/fixtures/users/user.json`);
        }
      },
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  _postWriting() {
    return {
      configureCoverage() {
        if (!this.cypressCoverage) return;
        this.packageJson.merge({
          devDependencies: {
            'babel-loader': this.configOptions.dependabotPackageJson.devDependencies['babel-loader'],
            'babel-plugin-istanbul': this.configOptions.dependabotPackageJson.devDependencies['babel-plugin-istanbul'],
            '@cypress/code-coverage': this.configOptions.dependabotPackageJson.devDependencies['@cypress/code-coverage'],
          },
          scripts: {
            'prewebapp:instrumenter': 'npm run clean-www && rimraf .nyc_output coverage',
            'webapp:instrumenter': 'ng build --configuration instrumenter',
          },
        });
        if (this.clientFrameworkAngular) {
          // Add 'ng build --configuration instrumenter' support
          this.createStorage('angular.json').setPath(
            `projects.${_.kebabCase(this.baseName)}.architect.build.configurations.instrumenter`,
            {}
          );
          this.addWebpackConfig(`targetOptions.configuration === 'instrumenter'
      ? {
          module: {
            rules: [
              {
                test: /\\.(js|ts)$/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      plugins: ['istanbul'],
                    },
                  }
                ],
                enforce: 'post',
                include: path.resolve(__dirname, '../${constants.CLIENT_MAIN_SRC_DIR}'),
                exclude: [/\\.(e2e|spec)\\.ts$/, /node_modules/, /(ngfactory|ngstyle)\\.js/],
              },
            ],
          },
        }
      : {}`);
        }
      },
    };
  }

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }
};

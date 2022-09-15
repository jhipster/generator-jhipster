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
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const writeFiles = require('./files').writeFiles;
const constants = require('../generator-constants');
const { GENERATOR_CYPRESS } = require('../generator-list');
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');

/* eslint-disable consistent-return */
module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    if (this.options.help) {
      return;
    }

    this.loadRuntimeOptions();
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CYPRESS);
    }
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  _prompting() {
    return {
      async askForCypressOptions() {
        if (this.options.existingProject || !(this.jhipsterConfig.testFrameworks || []).includes(CYPRESS)) {
          return;
        }
        await this.prompt(
          [
            {
              when: this.jhipsterConfig.clientFramework === constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR,
              type: 'confirm',
              name: 'cypressCoverage',
              message: 'Would you like to generate code coverage for Cypress tests? [Experimental]',
            },
            {
              type: 'confirm',
              name: 'cypressAudit',
              message: 'Would you like to audit Cypress tests?',
            },
          ],
          this.config
        );
      },
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
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
        this.cypressFolder = `${this.CLIENT_TEST_SRC_DIR}cypress/`;
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return super._missingPreDefault();
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/support/keycloak-oauth2.ts`);
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/fixtures/users/user.json`);
        }
        if (this.isJhipsterVersionLessThan('7.8.2')) {
          this.removeFile('cypress.json');
          this.removeFile('cypress-audits.json');

          this.removeFile(`${this.cypressFolder}integration/administration/administration.spec.ts`);
          this.removeFile(`${this.cypressFolder}integration/lighthouse.audits.ts`);
          if (!this.authenticationTypeOauth2) {
            this.removeFile(`${this.cypressFolder}integration/account/login-page.spec.ts`);
          }
          if (!this.authenticationTypeOauth2 && !this.databaseTypeNo && !this.applicationTypeMicroservice) {
            this.removeFile(`${this.cypressFolder}integration/account/register-page.spec.ts`);
            this.removeFile(`${this.cypressFolder}integration/account/settings-page.spec.ts`);
            this.removeFile(`${this.cypressFolder}integration/account/password-page.spec.ts`);
            this.removeFile(`${this.cypressFolder}integration/account/reset-password-page.spec.ts`);
          }
        }
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
      loadPackageJson() {
        // Load common client package.json into dependabotPackageJson
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster('client', 'templates', 'common', 'package.json'))
        );
      },

      configure() {
        this.packageJson.merge({
          devDependencies: {
            'eslint-plugin-cypress': this.dependabotPackageJson.devDependencies['eslint-plugin-cypress'],
          },
        });
      },

      configureAudits() {
        if (!this.cypressAudit) return;
        this.packageJson.merge({
          devDependencies: {
            lighthouse: this.dependabotPackageJson.devDependencies.lighthouse,
            'cypress-audit': this.dependabotPackageJson.devDependencies['cypress-audit'],
          },
          scripts: {
            'cypress:audits': 'cypress open --e2e --config-file cypress-audits.config.js',
            'e2e:cypress:audits:headless': 'npm run e2e:cypress -- --config-file cypress-audits.config.js',
            'e2e:cypress:audits':
              // eslint-disable-next-line no-template-curly-in-string
              'cypress run --e2e --browser chrome --record ${CYPRESS_ENABLE_RECORD:-false} --config-file cypress-audits.config.js',
          },
        });
      },
      configureCoverage() {
        if (!this.cypressCoverage) return;
        this.packageJson.merge({
          devDependencies: {
            '@cypress/code-coverage': this.dependabotPackageJson.devDependencies['@cypress/code-coverage'],
            'babel-loader': this.dependabotPackageJson.devDependencies['babel-loader'],
            'babel-plugin-istanbul': this.dependabotPackageJson.devDependencies['babel-plugin-istanbul'],
            nyc: this.dependabotPackageJson.devDependencies.nyc,
          },
          scripts: {
            'clean-coverage': 'rimraf .nyc_output coverage',
            'pree2e:cypress:coverage': 'npm run clean coverage && npm run ci:server:await',
            'e2e:cypress:coverage': 'npm run e2e:cypress:headed',
            'poste2e:cypress:coverage': 'nyc report',
            'prewebapp:instrumenter': 'npm run clean-www && npm run clean-coverage',
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

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }
};

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
const chalk = require('chalk');
const _ = require('lodash');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const writeAngularFiles = require('./files-angular').writeFiles;
const writeReactFiles = require('./files-react').writeFiles;
const { writeFiles: writeVueFiles, customizeFiles: customizeVueFiles } = require('./files-vue');
const writeCommonFiles = require('./files-common').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { clientDefaultConfig } = require('../generator-defaults');
const { GENERATOR_CYPRESS, GENERATOR_COMMON, GENERATOR_LANGUAGES, GENERATOR_CLIENT } = require('../generator-list');

const { ANGULAR, REACT, VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');
const { OAUTH2 } = require('../../jdl/jhipster/authentication-types');
const databaseTypes = require('../../jdl/jhipster/database-types');

const NO_DATABASE = databaseTypes.NO;
const { CommonDBTypes } = require('../../jdl/jhipster/field-types');

const TYPE_STRING = CommonDBTypes.STRING;
const TYPE_UUID = CommonDBTypes.UUID;

let useBlueprints;

module.exports = class JHipsterClientGenerator extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

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

    this.existingProject = !!this.jhipsterConfig.clientFramework;

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints(GENERATOR_CLIENT);
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },

      setupClientConstants() {
        // Make constants available in templates
        this.LOGIN_REGEX = constants.LOGIN_REGEX_JS;
        this.ANGULAR = ANGULAR;
        this.REACT = REACT;
        this.VUE = VUE;
        this.NODE_VERSION = constants.NODE_VERSION;
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askForModuleName: prompts.askForModuleName,
      askForClient: prompts.askForClient,
      askForAdminUi: prompts.askForAdminUi,
      askForClientTheme: prompts.askForClientTheme,
      askForClientThemeVariant: prompts.askForClientThemeVariant,
    };
  }

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      configureGlobal() {
        // Make constants available in templates
        this.MAIN_SRC_DIR = this.CLIENT_MAIN_SRC_DIR;
        this.TEST_SRC_DIR = this.CLIENT_TEST_SRC_DIR;
        this.packagejs = packagejs;
      },

      saveConfig() {
        this.setConfigDefaults(clientDefaultConfig);
      },
    };
  }

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      composeCommon() {
        this.composeWithJHipster(GENERATOR_COMMON, true);
      },
      composeCypress() {
        const testFrameworks = this.jhipsterConfig.testFrameworks;
        if (!Array.isArray(testFrameworks) || !testFrameworks.includes(CYPRESS)) return;
        this.composeWithJHipster(GENERATOR_CYPRESS, true);
      },
      composeLanguages() {
        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (this.jhipsterConfig.enableTranslation === false) return;

        this.composeWithJHipster(GENERATOR_LANGUAGES, true);
      },
    };
  }

  get composing() {
    if (useBlueprints) return;
    return this._composing();
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

      validateSkipServer() {
        if (
          this.jhipsterConfig.skipServer &&
          !(
            this.jhipsterConfig.databaseType &&
            this.jhipsterConfig.devDatabaseType &&
            this.jhipsterConfig.prodDatabaseType &&
            this.jhipsterConfig.authenticationType
          )
        ) {
          this.error(
            `When using skip-server flag, you must pass a database option and authentication type using ${chalk.yellow(
              '--db'
            )} and ${chalk.yellow('--auth')} flags`
          );
        }
      },

      loadPackageJson() {
        // Load common client package.json into packageJson
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster('client', 'templates', 'common', 'package.json'))
        );
        // Load client package.json into packageJson
        const clientFramewok = this.jhipsterConfig.clientFramework === ANGULAR ? 'angular' : this.jhipsterConfig.clientFramework;
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster('client', 'templates', clientFramewok, 'package.json'))
        );
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
        this.enableI18nRTL = false;
        if (this.languages !== undefined) {
          this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
        }

        // Make dist dir available in templates
        this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);

        this.styleSheetExt = 'scss';
        this.DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.buildTool) + constants.CLIENT_DIST_DIR;

        // Application name modified, using each technology's conventions
        this.camelizedBaseName = _.camelCase(this.baseName);
        this.frontendAppName = this.getFrontendAppName();
        this.hipster = this.getHipster(this.baseName);
        this.capitalizedBaseName = _.upperFirst(this.baseName);
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.lowercaseBaseName = this.baseName.toLowerCase();
        this.humanizedBaseName = this.baseName.toLowerCase() === 'jhipster' ? 'JHipster' : _.startCase(this.baseName);

        if (this.authenticationType === OAUTH2 || this.databaseType === NO_DATABASE) {
          this.skipUserManagement = true;
        }
      },
    };
  }

  get preparing() {
    if (useBlueprints) return;
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      loadUserManagementEntities() {
        if (!this.configOptions.sharedEntities || !this.configOptions.sharedEntities.User) return;
        // Make user entity available to templates.
        this.user = this.configOptions.sharedEntities.User;
        this.userPrimaryKeyTypeString = this.user.primaryKey.type === TYPE_STRING;
        this.userPrimaryKeyTypeUUID = this.user.primaryKey.type === TYPE_UUID;
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_CLIENT, {
          app: {
            clientFramework: this.clientFramework,
            enableTranslation: this.enableTranslation,
            nativeLanguage: this.nativeLanguage,
            languages: this.languages,
          },
        });
      },
    };
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      write() {
        if (this.skipClient) return;
        switch (this.clientFramework) {
          case ANGULAR:
            return writeAngularFiles.call(this, useBlueprints);
          case REACT:
            return writeReactFiles.call(this, useBlueprints);
          case VUE:
            return writeVueFiles.call(this, useBlueprints);
          default:
          // do nothing by default
        }
      },
      writeCommonFiles() {
        if (this.skipClient) return;
        return writeCommonFiles.call(this, useBlueprints);
      },

      ...super._missingPostWriting(),
    };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      customizeFiles() {
        if (this.skipClient) return;
        if (this.clientFramework === VUE) {
          return customizeVueFiles.call(this);
        }
        return undefined;
      },

      packageJsonScripts() {
        if (this.skipClient) return;
        const packageJsonStorage = this.createStorage('package.json');
        const scriptsStorage = packageJsonStorage.createStorage('scripts');

        const packageJsonConfigStorage = packageJsonStorage.createStorage('config').createProxy();
        if (process.env.JHI_PROFILE) {
          packageJsonConfigStorage.default_environment = process.env.JHI_PROFILE.includes('dev') ? 'dev' : 'prod';
        }

        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('wait-on', this.dependabotPackageJson.devDependencies['wait-on']);
        devDependencies.set('concurrently', this.dependabotPackageJson.devDependencies.concurrently);

        if (this.clientFramework === REACT) {
          scriptsStorage.set('ci:frontend:test', 'npm run webapp:build:$npm_package_config_default_environment && npm run test-ci');
        } else {
          scriptsStorage.set('ci:frontend:build', 'npm run webapp:build:$npm_package_config_default_environment');
          scriptsStorage.set('ci:frontend:test', 'npm run ci:frontend:build && npm test');
        }

        if (scriptsStorage.get('e2e')) {
          scriptsStorage.set({
            'ci:server:await':
              'echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on http-get://localhost:$npm_package_config_backend_port/management/health && echo "Server at port $npm_package_config_backend_port started"',
            'pree2e:headless': 'npm run ci:server:await',
            'ci:e2e:run': 'concurrently -k -s first "npm run ci:e2e:server:start" "npm run e2e:headless"',
            'e2e:dev': 'concurrently -k -s first "./mvnw" "e2e"',
          });
        }
      },
    };
  }

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }

  // Public API method used by the getter and also by Blueprints
  _end() {
    return {
      end() {
        if (this.skipClient) return;
        this.log(chalk.green.bold('\nClient application generated successfully.\n'));

        const logMsg = `Start your Webpack development server with:\n ${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;

        this.log(chalk.green(logMsg));
        if (!this.options.skipInstall) {
          this.spawnCommandSync(this.clientPackageManager, ['run', 'clean-www']);
        }
      },
    };
  }

  get end() {
    if (useBlueprints) return;
    return this._end();
  }
};

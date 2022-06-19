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
const chalk = require('chalk');
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const prompts = require('./prompts');
const { cleanup: cleanupAngular, writeFiles: writeAngularFiles } = require('./files-angular');
const { cleanup: cleanupReact, writeFiles: writeReactFiles } = require('./files-react');
const { cleanup: cleanupVue, writeFiles: writeVueFiles } = require('./files-vue');
const writeCommonFiles = require('./files-common').writeFiles;
const { clientI18nFiles } = require('../languages/files');

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

module.exports = class JHipsterClientGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

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
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CLIENT);
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
        this.MAIN_SRC_DIR = this.CLIENT_MAIN_SRC_DIR;
        this.TEST_SRC_DIR = this.CLIENT_TEST_SRC_DIR;
        this.packagejs = packagejs;
        this.LOGIN_REGEX = constants.LOGIN_REGEX_JS;
        this.ANGULAR = ANGULAR;
        this.REACT = REACT;
        this.VUE = VUE;
        this.NODE_VERSION = constants.NODE_VERSION;
      },

      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

      configureDevServerPort() {
        this.devServerBasePort = this.jhipsterConfig.clientFramework === ANGULAR ? 4200 : 9060;

        if (this.jhipsterConfig.devServerBasePort !== undefined) return undefined;
        let devServerPort;

        if (this.jhipsterConfig.applicationIndex !== undefined) {
          devServerPort = this.devServerBasePort + this.jhipsterConfig.applicationIndex;
        } else if (!this.devServerPort) {
          devServerPort = this.devServerBasePort;
        }

        this.jhipsterConfig.devServerPort = devServerPort;
      },

      saveConfig() {
        this.setConfigDefaults(clientDefaultConfig);
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON, true);
      },
      async composeCypress() {
        const testFrameworks = this.jhipsterConfig.testFrameworks;
        if (!Array.isArray(testFrameworks) || !testFrameworks.includes(CYPRESS)) return;
        await this.composeWithJHipster(GENERATOR_CYPRESS, { existingProject: this.existingProject }, true);
      },
      async composeLanguages() {
        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (this.jhipsterConfig.enableTranslation === false) return;

        await this.composeWithJHipster(GENERATOR_LANGUAGES, true);
      },
    };
  }

  get [COMPOSING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._composing();
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
        this.loadPlatformConfig();
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

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

        if (this.authenticationType === OAUTH2 || this.databaseType === NO_DATABASE) {
          this.skipUserManagement = true;
        }
      },

      async loadNativeLanguage() {
        if (!this.jhipsterConfig.baseName) return;
        const context = {};
        this.loadAppConfig(undefined, context);
        this.loadDerivedAppConfig(context);
        this.loadClientConfig(undefined, context);
        this.loadDerivedClientConfig(context);
        this.loadServerConfig(undefined, context);
        this.loadPlatformConfig(undefined, context);
        this.loadTranslationConfig(undefined, context);
        await this._loadClientTranslations(context);
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

      loadUserManagementEntities() {
        if (!this.configOptions.sharedEntities || !this.configOptions.sharedEntities.User) return;
        // Make user entity available to templates.
        this.user = this.configOptions.sharedEntities.User;
        this.userPrimaryKeyTypeString = this.user.primaryKey.type === TYPE_STRING;
        this.userPrimaryKeyTypeUUID = this.user.primaryKey.type === TYPE_UUID;
      },

      loadEntities() {
        if (!this.configOptions.sharedEntities) {
          this.localEntities = [];
          return;
        }
        this.localEntities = Object.values(this.configOptions.sharedEntities).filter(entity => !entity.builtIn && !entity.skipClient);
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

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanupReact,
      cleanupVue,
      cleanupAngular,

      write() {
        if (this.skipClient) return;
        switch (this.clientFramework) {
          case ANGULAR:
            return writeAngularFiles.call(this);
          case REACT:
            return writeReactFiles.call(this);
          case VUE:
            return writeVueFiles.call(this);
          default:
          // do nothing by default
        }
      },
      writeCommonFiles() {
        if (this.skipClient) return;
        return writeCommonFiles.call(this);
      },

      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
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
      },

      microfrontend() {
        if (!this.microfrontend) return;
        if (this.clientFrameworkAngular) {
          const conditional = this.applicationTypeMicroservice ? "targetOptions.target === 'serve' ? {} : " : '';
          this.addWebpackConfig(`${conditional}require('./webpack.microfrontend')(config, options, targetOptions)`);
        } else if (this.clientFrameworkVue || this.clientFrameworkReact) {
          this.addWebpackConfig("require('./webpack.microfrontend')({ serve: options.env.WEBPACK_SERVE })");
        } else {
          throw new Error(`Client framework ${this.clientFramework} doesn't support microfrontends`);
        }
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._end();
  }

  /**
   * @experimental
   * Load client native translation.
   */
  async _loadClientTranslations(configContext = this) {
    configContext.clientTranslations = this.configOptions.clientTranslations;
    if (configContext.clientTranslations) {
      this.clientTranslations = configContext.clientTranslations;
      return;
    }
    const { nativeLanguage } = configContext;
    this.clientTranslations = configContext.clientTranslations = this.configOptions.clientTranslations = {};
    const rootTemplatesPath = this.fetchFromInstalledJHipster('languages/templates/');

    // Prepare and load en translation
    const translationFiles = await this.writeFiles({
      sections: clientI18nFiles,
      rootTemplatesPath,
      context: {
        ...configContext,
        lang: 'en',
        clientSrcDir: '__tmp__',
      },
    });

    // Prepare and load native translation
    configContext.lang = configContext.nativeLanguage;
    if (nativeLanguage && nativeLanguage !== 'en') {
      translationFiles.push(
        ...(await this.writeFiles({
          sections: clientI18nFiles,
          rootTemplatesPath,
          context: {
            ...configContext,
            lang: configContext.nativeLanguage,
            clientSrcDir: '__tmp__',
          },
        }))
      );
    }
    for (const translationFile of translationFiles) {
      _.merge(this.clientTranslations, this.readDestinationJSON(translationFile));
      delete this.env.sharedFs.get(translationFile).state;
    }
  }

  /**
   * @experimental
   * Get translation value for a key.
   *
   * @param translationKey {string} - key to be translated
   * @param [data] {object} - template data in case translated value is a template
   */
  _getClientTranslation(translationKey, data) {
    let translatedValue = _.get(this.clientTranslations, translationKey);
    if (translatedValue === undefined) {
      const [last, second, ...others] = translationKey.split('.').reverse();
      translatedValue = _.get(this.clientTranslations, `${others.reverse().join('.')}['${second}.${last}']`);
    }
    if (translatedValue === undefined) {
      return `Translation missing for ${translationKey}`;
    }
    if (!data) {
      return translatedValue;
    }
    const compiledTemplate = _.template(translatedValue, { interpolate: /{{([\s\S]+?)}}/g });
    return compiledTemplate(data);
  }
};

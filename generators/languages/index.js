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
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const prompts = require('./prompts');
const statistics = require('../statistics');
const constants = require('../generator-constants');
const { translationDefaultConfig } = require('../generator-defaults');
const { GENERATOR_LANGUAGES } = require('../generator-list');
const { clientI18nFiles } = require('./files');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    this.option('skip-prompts', {
      desc: 'Skip prompts',
      type: Boolean,
      hide: true,
      defaults: false,
    });
    // This makes it possible to pass `languages` by argument
    this.argument('languages', {
      type: Array,
      required: false,
      description: 'Languages',
    });

    // This adds support for a `--skip-client` flag
    this.option('skip-client', {
      desc: 'Skip installing client files',
      type: Boolean,
    });

    // This adds support for a `--skip-server` flag
    this.option('skip-server', {
      desc: 'Skip installing server files',
      type: Boolean,
    });

    this.option('regenerate', {
      desc: 'Regenerate languages files',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // Validate languages passed as argument.
    // Additional languages, will not replace current ones.
    this.languagesToApply = this.options.languages;
    if (this.languagesToApply) {
      this.languagesToApply.forEach(language => {
        if (!this.isSupportedLanguage(language)) {
          this.log('\n');
          this.error(
            `Unsupported language "${language}" passed as argument to language generator.` +
              `\nSupported languages: ${_.map(this.getAllSupportedLanguageOptions(), o => `\n  ${_.padEnd(o.value, 5)} (${o.name})`).join(
                ''
              )}`
          );
        }
      });
    }
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('languages', { languages: this.languagesToApply, arguments: this.options.languages });
    }
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      validate() {
        if (this.languagesToApply) {
          if (this.skipClient) {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for server`));
          } else if (this.skipServer) {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for client`));
          } else {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')}`));
          }
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
      askI18n: prompts.askI18n,
      askForLanguages: prompts.askForLanguages,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      defaults() {
        if (!this.jhipsterConfig.nativeLanguage) {
          // If native language is not set, use defaults, otherwise languages will be built with nativeLanguage.
          this.setConfigDefaults(translationDefaultConfig);
          this.languagesToApply = this.jhipsterConfig.languages;
        }
      },
      updateLanguages() {
        if (this.jhipsterConfig.enableTranslation) {
          if (!this.jhipsterConfig.languages || !this.jhipsterConfig.languages.includes(this.jhipsterConfig.nativeLanguage)) {
            // First time we are generating the native language
            if (!this.languagesToApply) {
              this.languagesToApply = [this.jhipsterConfig.nativeLanguage];
            } else {
              this.languagesToApply.unshift(this.jhipsterConfig.nativeLanguage);
            }
          }
          // Concatenate the native language, current languages, and the new languages.
          this.jhipsterConfig.languages = _.union(
            [this.jhipsterConfig.nativeLanguage],
            this.jhipsterConfig.languages || [],
            this.languagesToApply || []
          );
        } else {
          // Following tasks from this generator will be skipped.
          this.cancelCancellableTasks();
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
      setDefaultConfig() {
        this.setConfigDefaults();
      },
      getSharedConfigOptions() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadPlatformConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
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
        if (this.options.regenerate) {
          this.languagesToApply = this.languages;
        } else {
          this.languagesToApply = this.languagesToApply || [];
        }

        // Make dist dir available in templates
        this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  _default() {
    return {
      ...super._missingPreDefault(),

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_LANGUAGES);
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
      async writeClientTranslations() {
        if (this.skipClient) return;
        // make it Promise.all() when `this.lang = lang;` can be dropped.
        for (const lang of this.languagesToApply) {
          this.lang = lang;
          await this.writeFiles({ sections: clientI18nFiles });
        }
      },
      translateFile() {
        this.languagesToApply.forEach(language => {
          if (!this.skipServer) {
            this.installI18nServerFilesByLanguage(this, constants.SERVER_MAIN_RES_DIR, language, constants.SERVER_TEST_RES_DIR);
          }
          statistics.sendSubGenEvent('languages/language', language);
        });
      },

      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  _postWriting() {
    return {
      write() {
        if (!this.skipClient) {
          this.updateLanguagesInDayjsConfiguation(this.languages);
          if (this.clientFramework === ANGULAR) {
            this.updateLanguagesInLanguagePipe(this.languages);
            this.updateLanguagesInLanguageConstantNG2(this.languages);
            this.updateLanguagesInWebpackAngular(this.languages);
          }
          if (this.clientFramework === REACT) {
            this.updateLanguagesInLanguagePipe(this.languages);
            this.updateLanguagesInWebpackReact(this.languages);
          }
          if (this.clientFramework === VUE) {
            this.vueUpdateLanguagesInTranslationStore(this.languages);
            this.vueUpdateI18nConfig(this.languages);
            this.vueUpdateLanguagesInWebpack(this.languages);
          }
        }
        if (!this.skipUserManagement && !this.skipServer) {
          this.updateLanguagesInLanguageMailServiceIT(this.languages, this.packageFolder);
        }
      },

      ...super._missingPostWriting(),
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }
};

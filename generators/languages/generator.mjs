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
/* eslint-disable consistent-return */
import chalk from 'chalk';
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { askForLanguages, askI18n } from './prompts.mjs';
import statistics from '../statistics.mjs';
import { GENERATOR_LANGUAGES, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import { clientI18nFiles } from './files.mjs';
import { writeEntityFiles } from './entity-files.mjs';
import TranslationData from './translation-data.mjs';
import { findLanguageForTag, supportedLanguages } from './support/languages.mjs';
import { updateLanguagesTask as updateLanguagesInAngularTask } from '../angular/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInReact } from '../react/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInVue } from '../vue/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInJava } from '../server/support/index.mjs';
import { SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';
import upgradeFilesTask from './upgrade-files-task.mjs';

/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @extends {BaseApplicationGenerator}
 */
export default class LanguagesGenerator extends BaseApplicationGenerator {
  supportedLanguages;
  /**
   * Languages to be generated.
   * Can be incremental or every language.
   */
  languagesToApply;

  constructor(args, options, features) {
    super(args, options, { skipParseOptions: false, ...features });

    this.option('skip-prompts', {
      description: 'Skip prompts',
      type: Boolean,
      hide: true,
      default: false,
    });
    // This makes it possible to pass `languages` by argument
    this.argument('languages', {
      type: Array,
      required: false,
      description: 'Languages',
    });

    // This adds support for a `--skip-client` flag
    this.option('skip-client', {
      description: 'Skip installing client files',
      type: Boolean,
    });

    // This adds support for a `--skip-server` flag
    this.option('skip-server', {
      description: 'Skip installing server files',
      type: Boolean,
    });

    this.option('regenerate', {
      description: 'Regenerate languages files',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // Validate languages passed as argument.
    // Additional languages, will not replace current ones.
    this.languagesToApply = [this.options.nativeLanguage, ...(this.options.languages ?? [])].filter(Boolean);
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      this.supportedLanguages = supportedLanguages;
      const composedBlueprints = await this.composeWithBlueprints('languages', {
        generatorOptions: {
          languages: this.languagesToApply,
          arguments: this.options.languages,
        },
      });
      for (const blueprint of composedBlueprints) {
        if (blueprint.supportedLanguages) {
          this.supportedLanguages = [...this.supportedLanguages, ...blueprint.supportedLanguages];
        }
      }
      if (this.languagesToApply.length > 0) {
        const unsupportedLanguage = this.languagesToApply.find(lang => !findLanguageForTag(lang, this.supportedLanguages));
        if (unsupportedLanguage) {
          throw new Error(
            `Unsupported language "${unsupportedLanguage}" passed as argument to language generator.` +
              `\nSupported languages: ${this.supportedLanguages
                .map(language => `\n  ${_.padEnd(language.languageTag, 5)} (${language.name})`)
                .join('')}`
          );
        }
      }
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return {
      validate() {
        if (this.languagesToApply.length > 0) {
          if (this.skipClient) {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for server`));
          } else if (this.skipServer) {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for client`));
          } else {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')}`));
          }
        }
      },
      exportControl({ control }) {
        control.supportedLanguages = this.supportedLanguages;
      },
    };
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return {
      checkPrompts({ control }) {
        const { enableTranslation, languages } = this.jhipsterConfig;
        const showPrompts = this.options.askAnswered || this.env.rootGenerator() === this;
        this.askForNativeLanguage = showPrompts || (!control.existingProject && !this.jhipsterConfig.nativeLanguage);
        this.askForMoreLanguages =
          enableTranslation !== false && (showPrompts || (!control.existingProject && (languages?.length ?? 0) < 1));
      },
      askI18n,
      askForLanguages,
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return this.asConfiguringTaskGroup({
      migrateLanguages() {
        if (this.isJhipsterVersionLessThan('7.10.0')) {
          this.migrateLanguages({ in: 'id' });
        }
      },
      defaults() {
        const { nativeLanguage, languages, enableTranslation } = this.jhipsterConfigWithDefaults;
        if (!enableTranslation) {
          if (!this.jhipsterConfig.nativeLanguage) {
            this.jhipsterConfig.nativeLanguage = nativeLanguage;
          }
          return;
        }
        if (!this.jhipsterConfig.nativeLanguage) {
          if (this.languagesToApply.length === 0) {
            this.languagesToApply = languages;
          }
          this.jhipsterConfig.nativeLanguage = nativeLanguage;
        }
        if (!this.jhipsterConfig.languages) {
          this.jhipsterConfig.languages = [];
        }
        if (this.jhipsterConfig.languages.length === 0 || this.jhipsterConfig.languages[0] !== this.jhipsterConfig.nativeLanguage) {
          this.jhipsterConfig.languages = [...new Set([nativeLanguage, ...languages])];
        }
        if (this.languagesToApply && this.languagesToApply.length > 0) {
          // Save new languages;
          this.jhipsterConfig.languages = [...new Set([...this.jhipsterConfig.languages, ...this.languagesToApply])];
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return {
      prepareForTemplates({ application }) {
        if (application.enableTranslation) {
          if (this.options.regenerate) {
            this.languagesToApply = application.languages;
          } else {
            this.languagesToApply = [...new Set(this.languagesToApply || [])];
          }
        }
      },
    };
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return {
      async loadNativeLanguage({ application, entities, control }) {
        this.translationData = new TranslationData(this, control);

        const loadClientTranslations = async () => {
          await this.translationData.loadClientTranslations(application);
          for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
            await this.translationData.loadEntityClientTranslations(application, entity);
          }
        };

        if (application.enableTranslation) {
          // Translation is normally not needed, add support on demand for angular.
          control.getWebappTranslation = () => {
            throw new Error(
              `Translations are not loaded, call ${chalk.yellow("'await control.loadClientTranslations'")} to load translations`
            );
          };

          control.loadClientTranslations = async () => {
            await loadClientTranslations();
            control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
            delete control.loadClientTranslations;
          };
        } else {
          await loadClientTranslations();
          control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
        }
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_LANGUAGES);
      },
    };
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      upgradeFilesTask,
      async writeClientTranslations({ application }) {
        if (!application.enableTranslation || application.skipClient) return;
        await Promise.all(
          this.languagesToApply.map(lang =>
            this.writeFiles({
              sections: clientI18nFiles,
              context: {
                ...application,
                lang,
              },
            })
          )
        );
      },
      async translateFile({ application }) {
        if (!application.enableTranslation || application.skipServer) return;
        await Promise.all(
          this.languagesToApply.map(async lang => {
            const language = findLanguageForTag(lang);
            if (language.javaLocaleMessageSourceSuffix) {
              await this.writeFiles({
                sections: {
                  serverI18nFiles: [
                    {
                      path: SERVER_MAIN_RES_DIR,
                      renameTo: (data, filePath) => `${data.srcMainResources}${filePath}`,
                      templates: [`i18n/messages_${language.javaLocaleMessageSourceSuffix}.properties`],
                    },
                  ],
                  serverI18nTestFiles: [
                    {
                      path: SERVER_TEST_RES_DIR,
                      renameTo: (data, filePath) => `${data.srcTestResources}${filePath}`,
                      condition: data => !data.skipUserManagement,
                      templates: [`i18n/messages_${language.javaLocaleMessageSourceSuffix}.properties`],
                    },
                  ],
                },
                context: {
                  ...application,
                  lang,
                },
              });
            }
            statistics.sendSubGenEvent('languages/language', language);
          })
        );
      },
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      ...writeEntityFiles(),
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return {
      write({ application, control }) {
        if (application.enableTranslation && !application.skipClient) {
          if (application.clientFrameworkAngular) {
            updateLanguagesInAngularTask.call(this, { application, control });
          }
          if (application.clientFrameworkReact) {
            updateLanguagesInReact.call(this, { application, control });
          }
          if (application.clientFrameworkVue) {
            updateLanguagesInVue.call(this, { application, control });
          }
        }
        if (application.enableTranslation && application.generateUserManagement && !application.skipServer) {
          updateLanguagesInJava.call(this, { application, control });
        }
      },
    };
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  migrateLanguages(languagesToMigrate) {
    const { languages, nativeLanguage } = this.jhipsterConfig;
    if (languagesToMigrate[nativeLanguage]) {
      this.jhipsterConfig.nativeLanguage = languagesToMigrate[nativeLanguage];
    }
    if (languages && languages.some(lang => languagesToMigrate[lang])) {
      this.jhipsterConfig.languages = languages.map(lang => languagesToMigrate[lang] ?? lang);
    }
  }
}

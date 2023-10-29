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
import * as _ from 'lodash-es';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { askForLanguages, askI18n } from './prompts.mjs';
import statistics from '../statistics.mjs';
import { GENERATOR_LANGUAGES, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import { clientI18nFiles } from './files.mjs';
import { writeEntityFiles } from './entity-files.mjs';
import TranslationData, { createTranslationsFileFilter, createTranslationsFilter } from './translation-data.mjs';
import { findLanguageForTag, supportedLanguages } from './support/languages.mjs';
import { updateLanguagesTask as updateLanguagesInAngularTask } from '../angular/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInReact } from '../react/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInVue } from '../vue/support/index.mjs';
import { updateLanguagesTask as updateLanguagesInJava } from '../server/support/index.mjs';
import { SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';
import command from './command.mjs';
import { QUEUES } from '../base-application/priorities.mjs';

const { startCase } = _;

/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @extends {BaseApplicationGenerator}
 */
export default class LanguagesGenerator extends BaseApplicationGenerator {
  translationData;
  supportedLanguages;
  languages;
  /**
   * Languages to be generated.
   * Can be incremental or every language.
   */
  languagesToApply;
  composedBlueprints;
  languageCommand;
  writeJavaLanguageFiles;
  regenerateLanguages;

  constructor(args, options, features) {
    super(args, options, features);

    this.languageCommand = this.options.commandName === 'languages';
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      this.supportedLanguages = supportedLanguages;
      this.composedBlueprints = await this.composeWithBlueprints('languages', {
        generatorArgs: this.options.languages,
      });
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return this.asInitializingTaskGroup({
      parseCli() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
      languagesToApply() {
        // Validate languages passed as argument.
        // Additional languages, will not replace current ones.
        this.languagesToApply = [this.options.nativeLanguage, ...(this.languages ?? [])].filter(Boolean);
      },
      validateSupportedLanguages() {
        for (const blueprint of this.composedBlueprints) {
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
                  .join('')}`,
            );
          }
        }
      },
      validate() {
        if (this.languagesToApply.length > 0) {
          if (this.jhipsterConfig.skipClient) {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for server`));
          } else if (this.jhipsterConfig.skipServer) {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for client`));
          } else {
            this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')}`));
          }
        }
      },
      exportControl({ control }) {
        control.supportedLanguages = this.supportedLanguages;
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return this.asPromptingTaskGroup({
      checkPrompts({ control }) {
        const { enableTranslation, languages } = this.jhipsterConfig;
        const showPrompts = this.options.askAnswered || this.languageCommand;
        this.askForNativeLanguage = showPrompts || (!control.existingProject && !this.jhipsterConfig.nativeLanguage);
        this.askForMoreLanguages =
          enableTranslation !== false && (showPrompts || (!control.existingProject && (languages?.length ?? 0) < 1));
      },
      askI18n,
      askForLanguages,
    });
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
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application, source }) {
        if (application.enableTranslation) {
          if (!this.languageCommand || this.regenerateLanguages) {
            this.languagesToApply = application.languages;
          } else {
            this.languagesToApply = [...new Set(this.languagesToApply || [])];
          }
        }

        source.addEntityTranslationKey = ({ translationKey, translationValue, language }) => {
          this.mergeDestinationJson(`${application.clientSrcDir}i18n/${language}/global.json`, {
            global: {
              menu: {
                entities: {
                  [translationKey]: translationValue,
                },
              },
            },
          });
        };
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async loadNativeLanguage({ application, control }) {
        if (application.skipClient) return;
        control.translations = control.translations ?? {};
        this.translationData = new TranslationData({ generator: this, translations: control.translations });
        const { clientSrcDir, enableTranslation, nativeLanguage } = application;
        const fallbackLanguage = 'en';
        this.queueLoadLanguages({ clientSrcDir, enableTranslation, nativeLanguage, fallbackLanguage });
        const filter = createTranslationsFilter({ clientSrcDir, nativeLanguage, fallbackLanguage });
        this.env.sharedFs.on('change', filePath => {
          if (filter(filePath)) {
            this.queueLoadLanguages({ clientSrcDir, enableTranslation, nativeLanguage, fallbackLanguage });
          }
        });

        control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_LANGUAGES);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async writeClientTranslations({ application }) {
        if (application.skipClient) return;
        const languagesToApply = application.enableTranslation ? this.languagesToApply : [...new Set([application.nativeLanguage, 'en'])];
        await Promise.all(
          languagesToApply.map(lang =>
            this.writeFiles({
              sections: clientI18nFiles,
              context: {
                ...application,
                lang,
              },
            }),
          ),
        );
      },
      async translateFile({ application }) {
        if (
          !application.enableTranslation ||
          application.skipServer ||
          (!application.backendTypeSpringBoot && !this.writeJavaLanguageFiles)
        )
          return;
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
          }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      ...writeEntityFiles(),
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
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
        if (
          application.enableTranslation &&
          application.generateUserManagement &&
          !application.skipServer &&
          (application.backendTypeSpringBoot || this.writeJavaLanguageFiles)
        ) {
          updateLanguagesInJava.call(this, { application, control });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      addEntities({ application, entities, source }) {
        if (application.skipClient) return;
        const languagesToApply = application.enableTranslation ? this.languagesToApply : [...new Set([application.nativeLanguage, 'en'])];
        for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
          for (const language of languagesToApply) {
            source.addEntityTranslationKey?.({
              language,
              translationKey: entity.entityTranslationKeyMenu,
              translationValue: entity.entityClassHumanized ?? startCase(entity.entityClass),
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
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

  queueLoadLanguages({ enableTranslation, clientSrcDir, nativeLanguage, fallbackLanguage = 'en' }) {
    this.queueTask({
      method: async () => {
        const filter = createTranslationsFileFilter({ clientSrcDir, nativeLanguage, fallbackLanguage });
        await this.pipeline(
          {
            name: 'loading translations',
            filter: file => file.path.startsWith(this.destinationPath()) && filter(file),
            refresh: true,
          },
          this.translationData.loadFromStreamTransform({
            enableTranslation,
            clientSrcDir,
            nativeLanguage,
            fallbackLanguage,
          }),
        );
      },
      taskName: 'loadingTranslations',
      queueName: QUEUES.LOADING_TRANSLATIONS_QUEUE,
      once: true,
    });
  }
}

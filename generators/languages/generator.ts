// @ts-nocheck
/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import chalk from 'chalk';
import { padEnd, startCase } from 'lodash-es';

import BaseApplicationGenerator from '../base-application/index.js';
import { updateLanguagesTask as updateLanguagesInAngularTask } from '../angular/support/index.js';
import { updateLanguagesTask as updateLanguagesInReact } from '../react/support/index.js';
import { updateLanguagesTask as updateLanguagesInVue } from '../vue/support/index.js';
import { updateLanguagesTask as updateLanguagesInJava } from '../server/support/index.js';
import { SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.js';
import { QUEUES } from '../base-application/priorities.js';
import { PRIORITY_NAMES } from '../base/priorities.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import { findLanguageForTag, supportedLanguages } from './support/languages.js';
import TranslationData, { createTranslationsFileFilter, createTranslationsFilter } from './translation-data.js';
import { writeEntityFiles } from './entity-files.js';
import { clientI18nFiles } from './files.js';
import { askForLanguages, askI18n } from './prompts.js';

const { NO: NO_CLIENT_FRAMEWORK, ANGULAR } = clientFrameworkTypes;
/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @extends {BaseApplicationGenerator}
 */
export default class LanguagesGenerator extends BaseApplicationGenerator {
  askForMoreLanguages!: boolean;
  askForNativeLanguage!: boolean;
  translationData: TranslationData;
  supportedLanguages;
  languages;
  /**
   * Languages to be generated.
   * Can be incremental or every language.
   */
  languagesToApply;
  composedBlueprints: string[] = [];
  languageCommand;
  writeJavaLanguageFiles;
  regenerateLanguages;

  constructor(args, options, features) {
    super(args, options, features);

    this.languageCommand = this.options.commandName === 'languages';
  }

  async beforeQueue() {
    this.supportedLanguages = supportedLanguages;
    if (!this.fromBlueprint) {
      this.composedBlueprints = await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
    }

    if (
      !this.jhipsterConfigWithDefaults.skipClient &&
      this.jhipsterConfigWithDefaults.clientFramework !== NO_CLIENT_FRAMEWORK &&
      (!this.jhipsterConfig.enableTranslation || this.jhipsterConfigWithDefaults.clientFramework === ANGULAR)
    ) {
      // We must write languages files for translation process for entities only generation.
      // Angular frontend uses translation files even if enableTranslation is enabled.
      // As side effect, with angular frontends, translation files will be written for nativeLanguage for entity only generation.
      this.setFeatures({ disableSkipPriorities: true });
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return this.asInitializingTaskGroup({
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
                  .map(language => `\n  ${padEnd(language.languageTag, 5)} (${language.name})`)
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
        const { nativeLanguage, enableTranslation } = this.jhipsterConfigWithDefaults;
        const isLanguageConfigured = Boolean(this.jhipsterConfig.nativeLanguage);
        // Prompts detects current language. Save default native language for next execution.
        this.config.defaults({ nativeLanguage });
        if (!enableTranslation) {
          return;
        }
        this.config.defaults({ languages: [] });
        if (!isLanguageConfigured && this.languagesToApply.length === 0) {
          // If languages is not configured, apply defaults.
          this.languagesToApply = this.jhipsterConfigWithDefaults.languages;
        }
        if (this.jhipsterConfig.languages.length === 0 || this.jhipsterConfig.languages[0] !== this.jhipsterConfig.nativeLanguage) {
          // Set native language as first language.
          this.jhipsterConfig.languages = [...new Set([nativeLanguage, ...this.jhipsterConfig.languages])];
        }
        if (this.languagesToApply && this.languagesToApply.length > 0) {
          // Save new languages.
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
        const listener = filePath => {
          if (filter(filePath)) {
            this.env.sharedFs.removeListener('change', listener);
            this.queueLoadLanguages({ clientSrcDir, enableTranslation, nativeLanguage, fallbackLanguage });
          }
        };
        this.env.sharedFs.on('change', listener);

        control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
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
          (!application.backendTypeSpringBoot && !this.writeJavaLanguageFiles) ||
          this.options.skipPriorities?.includes?.(PRIORITY_NAMES.POST_WRITING)
        )
          return;
        await Promise.all(
          this.languagesToApply.map(async lang => {
            const language = findLanguageForTag(lang)!;
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
        if (this.options.skipPriorities?.includes?.(PRIORITY_NAMES.POST_WRITING)) return;

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
          application.backendTypeJavaAny &&
          application.backendTypeSpringBoot
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
        for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtInUser)) {
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
    if (languagesToMigrate[nativeLanguage!]) {
      this.jhipsterConfig.nativeLanguage = languagesToMigrate[nativeLanguage!];
    }
    if (languages?.some(lang => languagesToMigrate[lang])) {
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

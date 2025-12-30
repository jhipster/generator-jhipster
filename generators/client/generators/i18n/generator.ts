/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { startCase } from 'lodash-es';

import BaseApplicationGenerator from '../../../base-application/generator.ts';
import { QUEUES } from '../../../base-application/priorities.ts';
import { getEnumInfo } from '../../../base-application/support/enum.ts';
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.ts';
import { type Language, findLanguageForTag } from '../../../languages/support/languages.ts';
import TranslationData, { createTranslationsFileFilter, createTranslationsFilter } from '../../../languages/translation-data.ts';
import { ClientApplicationGenerator } from '../../generator.ts';

export default class I18NGenerator extends ClientApplicationGenerator {
  translationData!: TranslationData;
  languagesToGenerate!: readonly Language[];

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('client');
    // TODO entityClass is required for translations, should be moved to base application.
    await this.dependsOnBootstrap('java');
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      migrateLanguages({ control }) {
        if (control.isJhipsterVersionLessThan('7.10.0')) {
          this.migrateLanguages({ in: 'id' });
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async bootstrap() {
        // Make sure generators languages callbacks are correctly initialized.
        const { clientFramework = 'no' } = this.jhipsterConfigWithDefaults;
        if (clientFramework !== 'no') {
          try {
            await this.dependsOnBootstrap(clientFramework);
          } catch {
            this.log.warn(`${clientFramework} bootstrap generator not found. Client languages may not be updated.`);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application, source }) {
        source.addEntityTranslationKey = ({ translationKey, translationValue, language }) => {
          this.mergeDestinationJson(`${application.clientI18nDir}${language}/global.json`, {
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

  get [ClientApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      languagesToGenerate({ application }) {
        this.languagesToGenerate =
          application.enableTranslation && application.languagesToGenerateDefinition
            ? application.languagesToGenerateDefinition
            : [...new Set([application.nativeLanguage, 'en'])].map(lang => findLanguageForTag(lang, application.supportedLanguages)!);
      },
      async loadNativeLanguage({ application }) {
        application.translations = application.translations ?? {};
        this.translationData = new TranslationData({ generator: this, translations: application.translations });
        const { clientI18nDir, enableTranslation, nativeLanguage } = application;
        const fallbackLanguage = 'en';
        this.queueLoadLanguages({ clientI18nDir, enableTranslation, nativeLanguage, fallbackLanguage });
        const filter = createTranslationsFilter({ clientI18nDir, nativeLanguage, fallbackLanguage });
        const listener = (filePath: string): void => {
          if (filter(filePath)) {
            this.env.sharedFs.removeListener('change', listener);
            this.queueLoadLanguages({ clientI18nDir, enableTranslation, nativeLanguage, fallbackLanguage });
          }
        };
        this.env.sharedFs.on('change', listener);

        application.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
      },
    });
  }

  get [ClientApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async writeClientTranslations({ application }) {
        await Promise.all(
          this.languagesToGenerate!.map(({ languageTag }) =>
            this.writeFiles({
              sections: {
                clientI18nFiles: [
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['error.json', 'login.json', 'password.json', 'register.json', 'sessions.json', 'settings.json'],
                  },
                  {
                    condition: ctx => ctx.clientFrameworkVue && ctx.enableTranslation && !ctx.microfrontend,
                    path: `${CLIENT_MAIN_SRC_DIR}/i18n/`,
                    renameTo: context => `${context.clientI18nDir}${context.lang}/${context.lang}.js`,
                    templates: ['index.js'],
                  },
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    templates: ['activate.json', 'global.json', 'home.json', 'reset.json'],
                  },
                  {
                    condition: context => context.withAdminUi,
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    transform: false,
                    templates: [
                      'configuration.json',
                      'logs.json',
                      'metrics.json',
                      {
                        transform: true,
                        file: 'health.json',
                      },
                    ],
                  },
                  {
                    condition: context => context.communicationSpringWebsocket,
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['tracker.json'],
                  },
                  {
                    condition: context => context.applicationTypeGateway,
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['gateway.json'],
                  },
                ],
              },
              context: {
                ...application,
                lang: languageTag,
              },
            }),
          ),
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeEntityFiles({ application, entities }) {
        const entitiesToWriteTranslationFor = entities.filter(entity => !entity.skipClient && !entity.builtInUser);
        if (application.userManagement?.skipClient) {
          entitiesToWriteTranslationFor.push(application.userManagement);
        }

        // Copy each
        const { clientI18nDir, baseName, clientSrcDir, frontendAppName } = application;
        for (const entity of entitiesToWriteTranslationFor) {
          for (const { languageTag } of this.languagesToGenerate) {
            if (entity.builtInUserManagement) {
              await this.writeFiles({
                blocks: [
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.clientI18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['user-management.json'],
                  },
                ],
                context: { ...entity, baseName, clientSrcDir, clientI18nDir, frontendAppName, lang: languageTag },
              });
            } else {
              await this.writeFiles({
                sections: {
                  entityBaseFiles: [
                    {
                      templates: [
                        {
                          sourceFile: context => `entity/i18n/entity_${context.lang}.json.ejs`,
                          destinationFile: context => `${context.clientI18nDir}${context.lang}/${context.entityTranslationKey}.json`,
                        },
                      ],
                    },
                  ],
                },
                context: { ...entity, baseName, clientSrcDir, clientI18nDir, frontendAppName, lang: languageTag },
              });
            }
          }
        }

        await Promise.all(
          entities
            .filter(entity => !entity.skipClient && !entity.builtInUser)
            .map(entity =>
              entity.fields
                .map(field => {
                  if (!field.fieldIsEnum) return undefined;
                  return this.languagesToGenerate.map(({ languageTag }) =>
                    this.writeFiles({
                      sections: {
                        enumBaseFiles: [
                          {
                            templates: [
                              {
                                sourceFile: 'entity/i18n/enum.json.ejs',
                                destinationFile: context =>
                                  `${context.clientI18nDir}${context.lang}/${context.clientRootFolder}${context.enumInstance}.json`,
                              },
                            ],
                          },
                        ],
                      },
                      context: {
                        ...getEnumInfo(field, entity.clientRootFolder),
                        lang: languageTag,
                        frontendAppName,
                        clientI18nDir,
                        clientSrcDir,
                      },
                    }),
                  );
                })
                .flat(),
            )
            .flat(),
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      addEntities({ entities, source }) {
        for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtInUser)) {
          for (const { languageTag } of this.languagesToGenerate) {
            source.addEntityTranslationKey?.({
              language: languageTag,
              translationKey: entity.entityTranslationKeyMenu,
              translationValue: entity.entityNameHumanized ?? startCase(entity.entityNameCapitalized),
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  migrateLanguages(languagesToMigrate: Record<string, string>) {
    const { languages, nativeLanguage } = this.jhipsterConfig;
    if (languagesToMigrate[nativeLanguage!]) {
      this.jhipsterConfig.nativeLanguage = languagesToMigrate[nativeLanguage!];
    }
    if (languages?.some(lang => languagesToMigrate[lang as string])) {
      this.jhipsterConfig.languages = languages.map(lang => languagesToMigrate[lang as string] ?? lang);
    }
  }

  queueLoadLanguages({
    enableTranslation,
    clientI18nDir,
    nativeLanguage,
    fallbackLanguage = 'en',
  }: {
    enableTranslation: boolean;
    clientI18nDir: string;
    nativeLanguage: string;
    fallbackLanguage?: string;
  }) {
    this.queueTask({
      method: async () => {
        const filter = createTranslationsFileFilter({ clientI18nDir, nativeLanguage, fallbackLanguage });
        await this.pipeline(
          {
            name: 'loading translations',
            filter: file => file.path.startsWith(this.destinationPath()) && filter(file),
            refresh: true,
          },
          this.translationData.loadFromStreamTransform({
            enableTranslation,
            clientI18nDir,
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

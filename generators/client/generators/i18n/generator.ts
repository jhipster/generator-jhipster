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
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.js';
import TranslationData, { createTranslationsFileFilter, createTranslationsFilter } from '../../../languages/translation-data.ts';
import { ClientApplicationGenerator } from '../../generator.ts';

export default class I18NGenerator extends ClientApplicationGenerator {
  translationData!: TranslationData;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('client');
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
          this.mergeDestinationJson(`${application.i18nDir}${language}/global.json`, {
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
      async loadNativeLanguage({ application }) {
        application.translations = application.translations ?? {};
        this.translationData = new TranslationData({ generator: this, translations: application.translations });
        const { i18nDir, enableTranslation, nativeLanguage } = application;
        const fallbackLanguage = 'en';
        this.queueLoadLanguages({ i18nDir, enableTranslation, nativeLanguage, fallbackLanguage });
        const filter = createTranslationsFilter({ i18nDir, nativeLanguage, fallbackLanguage });
        const listener = (filePath: string): void => {
          if (filter(filePath)) {
            this.env.sharedFs.removeListener('change', listener);
            this.queueLoadLanguages({ i18nDir, enableTranslation, nativeLanguage, fallbackLanguage });
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
        const languagesToApply =
          application.enableTranslation && application.languagesToGenerate
            ? application.languagesToGenerate
            : [...new Set([application.nativeLanguage, 'en'])];
        await Promise.all(
          languagesToApply!.map(lang =>
            this.writeFiles({
              sections: {
                clientI18nFiles: [
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.i18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['error.json', 'login.json', 'password.json', 'register.json', 'sessions.json', 'settings.json'],
                  },
                  {
                    condition: ctx => ctx.clientFrameworkVue && ctx.enableTranslation && !ctx.microfrontend,
                    path: `${CLIENT_MAIN_SRC_DIR}/i18n/`,
                    renameTo: context => `${context.i18nDir}${context.lang}/${context.lang}.js`,
                    templates: ['index.js'],
                  },
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.i18nDir}${context.lang}/`,
                    templates: ['activate.json', 'global.json', 'home.json', 'reset.json'],
                  },
                  {
                    condition: context => context.withAdminUi,
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.i18nDir}${context.lang}/`,
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
                    to: context => `${context.i18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['tracker.json'],
                  },
                  {
                    condition: context => context.applicationTypeGateway,
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.i18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['gateway.json'],
                  },
                ],
              },
              context: {
                ...application,
                lang,
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
        const { i18nDir, baseName, clientSrcDir, frontendAppName } = application;
        const languagesToApply =
          application.enableTranslation && application.languagesToGenerate
            ? application.languagesToGenerate
            : [...new Set([application.nativeLanguage, 'en'])];
        for (const entity of entitiesToWriteTranslationFor) {
          for (const lang of languagesToApply) {
            if (entity.builtInUserManagement) {
              await this.writeFiles({
                blocks: [
                  {
                    from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
                    to: context => `${context.i18nDir}${context.lang}/`,
                    transform: false,
                    templates: ['user-management.json'],
                  },
                ],
                context: { ...entity, baseName, clientSrcDir, i18nDir, frontendAppName, lang },
              });
            } else {
              await this.writeFiles({
                sections: {
                  entityBaseFiles: [
                    {
                      templates: [
                        {
                          sourceFile: context => `entity/i18n/entity_${context.lang}.json.ejs`,
                          destinationFile: context => `${context.i18nDir}${context.lang}/${context.entityTranslationKey}.json`,
                        },
                      ],
                    },
                  ],
                },
                context: { ...entity, baseName, clientSrcDir, i18nDir, frontendAppName, lang },
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
                  return languagesToApply.map(lang =>
                    this.writeFiles({
                      sections: {
                        enumBaseFiles: [
                          {
                            templates: [
                              {
                                sourceFile: 'entity/i18n/enum.json.ejs',
                                destinationFile: context =>
                                  `${context.i18nDir}${context.lang}/${context.clientRootFolder}${context.enumInstance}.json`,
                              },
                            ],
                          },
                        ],
                      },
                      context: {
                        ...getEnumInfo(field, entity.clientRootFolder),
                        lang,
                        frontendAppName,
                        i18nDir,
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
      addEntities({ application, entities, source }) {
        const languagesToApply =
          application.enableTranslation && application.languagesToGenerate
            ? application.languagesToGenerate
            : [...new Set([application.nativeLanguage, 'en'])];
        for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtInUser)) {
          for (const language of languagesToApply) {
            source.addEntityTranslationKey?.({
              language,
              translationKey: entity.entityTranslationKeyMenu,
              translationValue: entity.entityClassHumanized ?? startCase(entity.entityNameCapitalized),
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
    i18nDir,
    nativeLanguage,
    fallbackLanguage = 'en',
  }: {
    enableTranslation: boolean;
    i18nDir: string;
    nativeLanguage: string;
    fallbackLanguage?: string;
  }) {
    this.queueTask({
      method: async () => {
        const filter = createTranslationsFileFilter({ i18nDir, nativeLanguage, fallbackLanguage });
        await this.pipeline(
          {
            name: 'loading translations',
            filter: file => file.path.startsWith(this.destinationPath()) && filter(file),
            refresh: true,
          },
          this.translationData.loadFromStreamTransform({
            enableTranslation,
            i18nDir,
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

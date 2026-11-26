/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { existsSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { join } from 'node:path';

import { startCase } from '../../../../lib/utils/string-utils.ts';
import BaseApplicationGenerator from '../../../base-application/generator.ts';
import { isContentTypeField } from '../../../base-application/internal/content-type-fields.ts';
import { getEnumInfo } from '../../../base-application/support/enum.ts';
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.ts';
import { findTranslationSource } from '../../../languages/generators/i18n-bootstrap/support/index.ts';
import { type Language, findLanguageForTag } from '../../../languages/support/languages.ts';
import { ClientApplicationGenerator } from '../../generator.ts';

import { type EntityTranslationTexts, buildEntityTranslation } from './internal/entity-translations.ts';
import { prepareClientTranslation } from './internal/translations.ts';

export default class I18NGenerator extends ClientApplicationGenerator {
  languagesToGenerate!: readonly Language[];

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('languages');
    await this.dependsOnJHipster('jhipster:languages:i18n-bootstrap');
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
        source.addEntityTranslationKey = keys => {
          // Each translation file is merged once, with all of its keys.
          const entitiesByLanguage: Record<string, Record<string, string>> = {};
          for (const { translationKey, translationValue, language } of [keys].flat()) {
            (entitiesByLanguage[language] ??= {})[translationKey] = translationValue;
          }
          for (const [language, entities] of Object.entries(entitiesByLanguage)) {
            this.mergeDestinationJson(`${application.clientI18nDir}${language}/global.json`, { global: { menu: { entities } } });
          }
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
          application.enableTranslation && application.languagesToGenerateDefinition ?
            application.languagesToGenerateDefinition
            // Generate native language + English as fallback, ensuring no duplicates if native language is English. Translation will fallback to English if a translation is missing for the native language.
          : [...new Set([application.nativeLanguage, 'en'])].map(lang => findLanguageForTag(lang, application.supportedLanguages)!);
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
          this.languagesToGenerate.map(({ languageTag }) =>
            this.writeFiles({
              templates: [
                {
                  condition: (data: any) => data.enableTranslation && (data.clientFrameworkVue || data.clientFrameworkReact),
                  sourceFile: `${CLIENT_MAIN_SRC_DIR}/i18n/index.js`,
                  destinationFile: data => `${data.clientI18nDir}${data.lang}/${data.lang}.js`,
                },
              ],
              context: {
                ...application,
                lang: languageTag,
              },
            }),
          ),
        );
        await this.writeFiles({
          templates: [
            {
              condition: (data: any) => data.enableTranslation && (data.clientFrameworkVue || data.clientFrameworkReact),
              sourceFile: 'build-plugins/i18n.ts',
              destinationFile: data => `${data.clientRootDir}build-plugins/i18n.ts`,
            },
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeGlobalTranslations({ application }) {
        if ((application.commandName === 'entity' || application.commandName === 'entities') && application.enableTranslation) {
          // For entity/entities sub generators, we need to load existing translations into mem-fs to be able to load them in the translation data.
          for await (const file of glob(`${application.clientI18nDir}**/*.json`, { cwd: this.destinationRoot(), withFileTypes: true })) {
            if (file.isFile()) {
              this.env.sharedFs.get(join(file.parentPath, file.name));
            }
          }
          return;
        }
        // writing/postWriting priorities are skipped by entity command, we need to write global translations here
        const files = [
          'error',
          'login',
          'password',
          'register',
          'sessions',
          'settings',
          'global',
          'home',
          'reset',
          ...(application.generateUserRegistration ? ['activate'] : []),
          ...(application.withAdminUi ? ['configuration', 'logs', 'metrics', 'health'] : []),
          ...((application as any).communicationSpringWebsocket ? ['tracker'] : []),
          ...(application.applicationTypeGateway ? ['gateway'] : []),
        ];
        for (const { languageTag } of this.languagesToGenerate) {
          for (const file of files) {
            await this.writeApplicationTranslation(application, languageTag, file);
          }
        }
      },
      async writeEntityFiles({ application, entities }) {
        // The fields the clients skip have no translation.
        const entitiesToWriteTranslationFor = (application.filterEntitiesAndPropertiesForClient?.(entities) ?? entities).filter(
          entity => !entity.skipClient && !entity.builtInUser,
        );
        if (application.userManagement?.skipClient) {
          entitiesToWriteTranslationFor.push(application.userManagement);
        }

        // Copy each
        const { clientI18nDir, baseName, clientSrcDir, frontendAppName } = application;
        for (const entity of entitiesToWriteTranslationFor) {
          for (const { languageTag } of this.languagesToGenerate) {
            if (entity.builtInUserManagement) {
              await this.writeApplicationTranslation(application, languageTag, 'user-management');
            } else {
              // The content type field of a blob is shown with its blob, under the translation of the blob.
              const context = {
                ...entity,
                fields: entity.fields.filter(field => !isContentTypeField(field)),
                baseName,
                clientSrcDir,
                clientI18nDir,
                frontendAppName,
                lang: languageTag,
              };
              // A template of the language, like one a blueprint gives, is written instead of the texts of the language.
              const languageTemplate = `entity/i18n/entity_${languageTag}.json.ejs`;
              if (this.jhipsterTemplatesFolders.some(folder => existsSync(join(folder, languageTemplate)))) {
                await this.writeFiles({
                  sections: {
                    entityBaseFiles: [
                      {
                        templates: [
                          {
                            sourceFile: languageTemplate,
                            destinationFile: data => `${data.clientI18nDir}${data.lang}/${data.entityTranslationKey}.json`,
                          },
                        ],
                      },
                    ],
                  },
                  context,
                });
                continue;
              }
              // The texts of the language, entity/i18n/<language>.json, of a blueprint first.
              const textsFile = this.jhipsterTemplatesFolders
                .map(folder => join(folder, `entity/i18n/${languageTag}.json`))
                .find(file => existsSync(file));
              if (!textsFile) {
                throw new Error(
                  `The entity translations of the language ${languageTag} are missing: no entity/i18n/${languageTag}.json file.`,
                );
              }
              application.addTranslation({
                languageTag,
                destinationFile: `${clientI18nDir}${languageTag}/${entity.entityTranslationKey}.json`,
                translation: buildEntityTranslation(context, this.fs.readJSON(textsFile) as unknown as EntityTranslationTexts),
              });
            }
          }
        }

        await Promise.all(
          entities
            .filter(entity => !entity.skipClient && !entity.builtInUser)
            .flatMap(entity =>
              entity.fields.flatMap(field => {
                if (!field.fieldIsEnum || field.clientConstantsAsValues) return [];
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
              }),
            ),
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      sonar({ application, source }) {
        if (!application.enableTranslation) return;
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S2068-i18n',
          ruleKey: 'secrets:S2068',
          resourceKey: `${application.clientI18nDir}**/*.json`,
          comment: 'Rule secrets:S2068 is ignored, the translations hold the label of the password, not a password',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      addEntities({ entities, source }) {
        const translationKeys = entities
          .filter(entity => !entity.skipClient && !entity.builtInUser && entity.entityTranslationKeyMenuPath.startsWith('global'))
          .flatMap(entity =>
            this.languagesToGenerate.map(({ languageTag }) => ({
              language: languageTag,
              translationKey: entity.entityTranslationKeyMenu,
              translationValue: entity.entityNameHumanized ?? startCase(entity.entityNameCapitalized),
            })),
          );
        if (translationKeys.length > 0) {
          source.addEntityTranslationKey?.(translationKeys);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  /**
   * Adds a translation file of the application in a language, from the file of the language, i18n/<language>/<file>.json of
   * the webapp, of a blueprint first: a template of it, <file>.json.ejs, like one a blueprint gives, is written instead.
   */
  async writeApplicationTranslation(application: any, languageTag: string, file: string): Promise<void> {
    const sourceFile = `${CLIENT_MAIN_SRC_DIR}i18n/${languageTag}/${file}.json`;
    const translationSource = findTranslationSource(this.jhipsterTemplatesFolders, sourceFile);
    if (!translationSource) {
      throw new Error(`The translation ${file} of the language ${languageTag} is missing: no ${sourceFile} file.`);
    }
    const destinationFile = `${application.clientI18nDir}${languageTag}/${file}.json`;
    if (translationSource.template) {
      await this.writeFiles({ templates: [{ sourceFile, destinationFile }], context: { ...application, lang: languageTag } });
      return;
    }
    application.addTranslation({
      languageTag,
      destinationFile,
      translation: prepareClientTranslation(file, this.fs.readJSON(translationSource.path) as Record<string, any>, application),
    });
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
}

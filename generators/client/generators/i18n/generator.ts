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

import { startCase } from '../../../../lib/utils/string-utils.ts';
import BaseApplicationGenerator from '../../../base-application/generator.ts';
import { isContentTypeField } from '../../../base-application/internal/content-type-fields.ts';
import { getEnumInfo } from '../../../base-application/support/enum.ts';
import type { Source as CommonSource } from '../../../common/types.d.ts';
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.ts';
import { ClientApplicationGenerator } from '../../generator.ts';

export default class I18NGenerator extends ClientApplicationGenerator {
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
            application.mergeTranslation({
              languageTag: language,
              destinationFile: `${application.clientI18nDir}${language}/global.json`,
              translation: { global: { menu: { entities } } },
            });
          }
        };
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async writeClientTranslations({ application }) {
        await Promise.all(
          application.translationLanguages.map(({ languageTag }) =>
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
        // The entity commands keep the translation files the application has.
        if ((application.commandName === 'entity' || application.commandName === 'entities') && application.enableTranslation) return;
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
        application.writeTranslationFiles({
          files,
          destinationFile: (languageTag, file) => `${application.clientI18nDir}${languageTag}/${file}.json`,
        });
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
          if (entity.builtInUserManagement) {
            application.writeTranslationFiles({
              files: ['user-management'],
              destinationFile: (languageTag, file) => `${clientI18nDir}${languageTag}/${file}.json`,
            });
            continue;
          }
          for (const { languageTag } of application.translationLanguages) {
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
            application.addTranslation({
              languageTag,
              destinationFile: `${clientI18nDir}${languageTag}/${entity.entityTranslationKey}.json`,
              translation: application.getEntityTranslation(languageTag, context),
            });
          }
        }

        for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtInUser)) {
          for (const field of entity.fields) {
            if (!field.fieldIsEnum || field.clientConstantsAsValues) continue;
            const { clientRootFolder, enumInstance, enumName, enumValues } = getEnumInfo(field, entity.clientRootFolder);
            for (const { languageTag } of application.translationLanguages) {
              application.addTranslation({
                languageTag,
                destinationFile: `${clientI18nDir}${languageTag}/${clientRootFolder}${enumInstance}.json`,
                translation: {
                  [frontendAppName]: {
                    [enumName]: { null: '', ...Object.fromEntries(enumValues.map(({ name, value }) => [name, value])) },
                  },
                },
              });
            }
          }
        }
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
      addEntities({ application, entities, source }) {
        const translationKeys = entities
          .filter(entity => !entity.skipClient && !entity.builtInUser && entity.entityTranslationKeyMenuPath.startsWith('global'))
          .flatMap(entity =>
            application.translationLanguages.map(({ languageTag }) => ({
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

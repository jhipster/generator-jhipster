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
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import ejs from 'ejs';

import { mutateDefaults } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.ts';
import { findLanguageForTag } from '../../support/languages.ts';
import TranslationData from '../../translation-data.ts';
import type { Application as LanguagesApplication, Entity as LanguagesEntity, Source as LanguagesSource } from '../../types.ts';

import { type EntityTranslationTexts, buildEntityTranslation } from './internal/entity-translations.ts';
import { getWebappTranslationPreparation } from './internal/webapp-translations.ts';
import { findTranslationSource, findTranslationSources, prepareTranslation } from './support/translation-file.ts';
import type { Application as I18nApplication, TranslationFiles } from './types.d.ts';

const FALLBACK_LANGUAGE = 'en';

/**
 * Prepares the translations of the application, whichever generator writes them: `translationLanguages` are the languages
 * translated, `loadTranslationFiles` loads all the files of each of them, `writeTranslationFiles` writes the ones the application uses, and a translation file is added by
 * `application.addTranslation`, written when the application is translated, else read without a file for the native language
 * and English, its fallback; `getWebappTranslation` gives the
 * translation of a key.
 */
export default class I18nBootstrapGenerator extends BaseApplicationGenerator<
  LanguagesEntity,
  LanguagesApplication<LanguagesEntity> & I18nApplication & { clientI18nDir?: string },
  any,
  any,
  LanguagesSource
> {
  translationData!: TranslationData;
  /** The translation files loaded, by language and by the name of the file. */
  loadedTranslations: Record<string, Record<string, Record<string, any>>> = {};

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('languages');
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareTranslations({ application }) {
        mutateDefaults(application, { translations: () => ({}) });
        this.translationData = new TranslationData({ generator: this, translations: application.translations });
        mutateDefaults(application, {
          // The native language and English, its fallback, are read when the application is not translated.
          translationLanguages: ({ enableTranslation, languagesToGenerateDefinition, nativeLanguage, supportedLanguages }) =>
            enableTranslation && languagesToGenerateDefinition ? languagesToGenerateDefinition : (
              [...new Set([nativeLanguage, FALLBACK_LANGUAGE])].map(languageTag => findLanguageForTag(languageTag, supportedLanguages)!)
            ),
          getEntityTranslation: () => (languageTag: string, entity: Record<string, any>) => this.getEntityTranslation(languageTag, entity),
          loadTranslationFiles: () => (files: TranslationFiles) => this.loadTranslationFiles(application, files),
          writeTranslationFiles: () => (arg: Parameters<I18nApplication['writeTranslationFiles']>[0]) =>
            this.writeTranslationFiles(application, arg),
          getWebappTranslation: () => (key: string, data?: Record<string, any>) => this.translationData.getClientTranslation(key, data),
          addTranslation:
            () =>
            ({ languageTag, destinationFile, translation }: Parameters<I18nApplication['addTranslation']>[0]) => {
              this.mergeLoadedTranslation(application, languageTag, translation);
              if (application.enableTranslation) {
                this.writeDestination(destinationFile, `${JSON.stringify(translation, null, 2)}\n`);
              }
            },
          mergeTranslation:
            () =>
            ({ languageTag, destinationFile, translation }: Parameters<I18nApplication['mergeTranslation']>[0]) => {
              this.mergeLoadedTranslation(application, languageTag, translation);
              if (application.enableTranslation) {
                this.mergeDestinationJson(destinationFile, translation);
              }
            },
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadWebappTranslations({ application }) {
        // Every translation file of the webapp is loaded, the files the client writes are chosen when writing.
        if (!application.clientI18nDir) return;
        application.loadTranslationFiles({
          templatesFolders: this.jhipsterTemplatesFolders,
          folder: languageTag => `${CLIENT_MAIN_SRC_DIR}i18n/${languageTag}`,
          ...getWebappTranslationPreparation(application),
          context: application,
        });
      },
      async loadExistingTranslations({ application }) {
        // The entity commands write the translations of their entities only: the files the application has are read.
        const { clientI18nDir, commandName, enableTranslation, nativeLanguage } = application as any;
        if (!clientI18nDir || !enableTranslation || (commandName !== 'entity' && commandName !== 'entities')) return;
        for (const languageTag of new Set([nativeLanguage, FALLBACK_LANGUAGE])) {
          const folder = this.destinationPath(`${clientI18nDir}${languageTag}`);
          if (!existsSync(folder)) continue;
          for (const file of (await readdir(folder)).filter(file => file.endsWith('.json')).sort()) {
            this.mergeLoadedTranslation(application, languageTag, this.fs.readJSON(join(folder, file)) as Record<string, any>);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  /** Merges a translation of a language into the translations of the native language, English as its fallback. */
  mergeLoadedTranslation(application: { nativeLanguage: string }, languageTag: string, translation: Record<string, any>): void {
    if (languageTag === application.nativeLanguage || languageTag === FALLBACK_LANGUAGE) {
      this.translationData.mergeTranslation(translation, languageTag !== application.nativeLanguage);
    }
  }

  /** The translation file of an entity in a language, from the template or the texts of the language. */
  getEntityTranslation(languageTag: string, entity: Record<string, any>): Record<string, any> {
    const template = findTranslationSource(this.jhipsterTemplatesFolders, `entity/i18n/entity_${languageTag}.json`);
    if (template?.template) {
      return JSON.parse(ejs.render(this.fs.read(template.path), { ...entity, lang: languageTag }, { filename: template.path }));
    }
    const texts = findTranslationSource(this.jhipsterTemplatesFolders, `entity/i18n/${languageTag}.json`);
    if (!texts || texts.template) {
      throw new Error(`The entity translations of the language ${languageTag} are missing: no entity/i18n/${languageTag}.json file.`);
    }
    return buildEntityTranslation(entity as any, this.fs.readJSON(texts.path) as unknown as EntityTranslationTexts);
  }

  /** Loads the translation files of each of the translated languages, all of them. */
  loadTranslationFiles(
    application: I18nApplication & { nativeLanguage: string },
    { templatesFolders, folder, names, conditions = {}, context = {} }: TranslationFiles,
  ): void {
    for (const { languageTag } of application.translationLanguages) {
      const sources = findTranslationSources(templatesFolders, folder(languageTag));
      if (Object.keys(sources).length === 0) {
        throw new Error(`The translations of the language ${languageTag} are missing: no ${folder(languageTag)} folder.`);
      }
      const loaded = (this.loadedTranslations[languageTag] ??= {});
      for (const [file, { path, template }] of Object.entries(sources)) {
        const content = this.fs.read(path);
        const translation = JSON.parse(template ? ejs.render(content, { ...context, lang: languageTag }, { filename: path }) : content);
        loaded[file] = prepareTranslation(translation, { names, conditions: conditions[file], options: context });
        this.mergeLoadedTranslation(application, languageTag, loaded[file]);
      }
    }
  }

  /** Writes loaded translation files of each of the translated languages, when the application is translated. */
  writeTranslationFiles(
    application: I18nApplication & { enableTranslation: boolean },
    { files, destinationFile }: Parameters<I18nApplication['writeTranslationFiles']>[0],
  ): void {
    if (!application.enableTranslation) return;
    for (const { languageTag } of application.translationLanguages) {
      for (const file of files) {
        const translation = this.loadedTranslations[languageTag]?.[file];
        if (!translation) {
          throw new Error(`The translation ${file} of the language ${languageTag} is not loaded.`);
        }
        this.writeDestination(destinationFile(languageTag, file), `${JSON.stringify(translation, null, 2)}\n`);
      }
    }
  }
}

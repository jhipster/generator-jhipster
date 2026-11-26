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
import { mutateDefaults } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { QUEUES } from '../../../base-application/priorities.ts';
import TranslationData, { createTranslationsFileFilter, createTranslationsFilter } from '../../translation-data.ts';
import type { Application as LanguagesApplication, Entity as LanguagesEntity, Source as LanguagesSource } from '../../types.ts';

import type { Application as I18nApplication } from './types.d.ts';

const FALLBACK_LANGUAGE = 'en';

/**
 * Prepares the translations of the application, whichever generator writes them: a translation file is added by
 * `application.addTranslation`, written when the application is translated, else read without a file for the native language
 * and English, its fallback; the translation files the generators write are read too. `getWebappTranslation` gives the
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
          getWebappTranslation: () => (key: string, data?: Record<string, any>) => this.translationData.getClientTranslation(key, data),
          addTranslation:
            () =>
            ({ languageTag, destinationFile, translation }: Parameters<I18nApplication['addTranslation']>[0]) => {
              if (application.enableTranslation) {
                this.writeDestination(destinationFile, `${JSON.stringify(translation, null, 2)}\n`);
              } else if (languageTag === application.nativeLanguage || languageTag === FALLBACK_LANGUAGE) {
                this.translationData.mergeTranslation(translation, languageTag !== application.nativeLanguage);
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
      loadTranslations({ application }) {
        const { clientI18nDir, enableTranslation, nativeLanguage } = application;
        if (!clientI18nDir) return;
        const options = { clientI18nDir, enableTranslation, nativeLanguage, fallbackLanguage: FALLBACK_LANGUAGE };
        this.queueLoadTranslations(options);
        // A translation file written after the loading is queued queues it again.
        const filter = createTranslationsFilter(options);
        const listener = (filePath: string): void => {
          if (filter(filePath)) {
            this.env.sharedFs.removeListener('change', listener);
            this.queueLoadTranslations(options);
          }
        };
        this.env.sharedFs.on('change', listener);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  queueLoadTranslations(options: { enableTranslation: boolean; clientI18nDir: string; nativeLanguage: string; fallbackLanguage: string }) {
    this.queueTask({
      method: async () => {
        const filter = createTranslationsFileFilter(options);
        await this.pipeline(
          {
            name: 'loading translations',
            filter: file => file.path.startsWith(this.destinationPath()) && filter(file),
            pendingFiles: false,
            refresh: true,
          },
          this.translationData.loadFromStreamTransform(options),
        );
      },
      taskName: 'loadingTranslations',
      queueName: QUEUES.LOADING_TRANSLATIONS_QUEUE,
      once: true,
    });
  }
}

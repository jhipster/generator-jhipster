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
import { mutateData } from '../../../../lib/utils/object.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { CONTEXT_DATA_SUPPORTED_LANGUAGES } from '../../support/constants.ts';
import { type Language, findLanguageForTag, supportedLanguages } from '../../support/languages.ts';
import type {
  Application as LanguagesApplication,
  Config as LanguagesConfig,
  Entity as LanguagesEntity,
  Options as LanguagesOptions,
} from '../../types.ts';

export default class BootstrapGenerator extends BaseApplicationGenerator<
  LanguagesEntity,
  LanguagesApplication<LanguagesEntity>,
  LanguagesConfig,
  LanguagesOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    supportedLanguages.forEach(lang => {
      this.supportedLanguages.set(lang.languageTag, lang);
    });

    await this.dependsOnBootstrap('base-application');
  }

  get supportedLanguages(): Map<string, Language> {
    return this.getContextData<Map<string, Language>>(CONTEXT_DATA_SUPPORTED_LANGUAGES, { factory: () => new Map() });
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadLanguages({ application }) {
        const supportedLanguagesArray = [...this.supportedLanguages.values()];
        const nativeLanguageDefinition = findLanguageForTag(application.nativeLanguage, supportedLanguagesArray);
        if (!nativeLanguageDefinition) {
          throw new Error(`Native language ${application.nativeLanguage} does not exist`);
        }
        application.nativeLanguageDefinition = nativeLanguageDefinition;
        if (application.enableTranslation) {
          application.languagesDefinition = application.languages
            .map(lang => findLanguageForTag(lang, supportedLanguagesArray)!)
            .filter(lang => lang);
          application.enableI18nRTL = (application.languagesDefinition ?? [application.nativeLanguageDefinition]).some(
            language => language.rtl,
          );
        } else {
          application.enableI18nRTL = application.nativeLanguageDefinition.rtl;
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareField({ entity, field }) {
        mutateData(field, {
          fieldTranslationKey: ({ fieldName }) => `${entity.i18nKeyPrefix}.${fieldName}`,
        });
      },
    });
  }
}

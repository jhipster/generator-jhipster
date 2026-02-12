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
import {
  type MutateDataParam,
  type MutateDataPropertiesWithRequiredProperties,
  overrideMutateDataProperty,
} from '../../lib/utils/object.ts';

import { type Language, findLanguageForTag } from './support/languages.ts';
import type { Application } from './types.ts';

export type LanguagesLoadingAddedApplicationProperties = {
  supportedLanguages: Language[];
  languages: string[];
  languagesDefinition: Language[];
  languagesToGenerate: string[];
  languagesToGenerateDefinition: Language[];
  addLanguageCallbacks: ((newLanguages: readonly Language[], allLanguages: readonly Language[]) => void)[];
};

export type LanguagesPreparingAddedApplicationProperties = {
  enableTranslation: boolean;
  enableI18nRTL: boolean;
  nativeLanguage: string;
  nativeLanguageDefinition: Language;
};

export type LanguagesAddedApplicationProperties = LanguagesLoadingAddedApplicationProperties & LanguagesPreparingAddedApplicationProperties;

export const mutateApplicationLoading = {
  __override__: false,

  supportedLanguages: () => [],
  languages: () => [],
  languagesDefinition: () => [],
  addLanguageCallbacks: () => [],
  languagesToGenerate: () => [],
  languagesToGenerateDefinition: () => [],
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<LanguagesAddedApplicationProperties>,
  LanguagesLoadingAddedApplicationProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,
  enableTranslation: false,
  nativeLanguage: 'en',
  languages: overrideMutateDataProperty(({ languages, nativeLanguage }: LanguagesAddedApplicationProperties) => {
    if (languages.length === 0) {
      languages.push(nativeLanguage);
    }
    return languages;
  }),
  nativeLanguageDefinition: ({ nativeLanguage, supportedLanguages }: LanguagesAddedApplicationProperties) => {
    const nativeLanguageDefinition = findLanguageForTag(nativeLanguage, supportedLanguages);
    if (!nativeLanguageDefinition) {
      throw new Error(`Unsupported native language: ${nativeLanguage}`);
    }
    return nativeLanguageDefinition;
  },
  languagesDefinition: overrideMutateDataProperty(
    ({ languages, languagesDefinition, supportedLanguages }: LanguagesAddedApplicationProperties) => {
      languages.forEach(lang => {
        if (languagesDefinition.some(def => def.languageTag === lang)) {
          return;
        }
        const languageDefinition = findLanguageForTag(lang, supportedLanguages);
        if (!languageDefinition) {
          throw new Error(`Unsupported language: ${lang}`);
        }
        languagesDefinition.push(languageDefinition);
      });
      return languagesDefinition;
    },
  ),
  languagesToGenerate: overrideMutateDataProperty(({ commandName, languagesToGenerate, nativeLanguage }: Application) => {
    if (languagesToGenerate.length === 0 && commandName !== 'languages') {
      if (!nativeLanguage) {
        throw new Error('A native language must be defined to generate languages');
      }
      languagesToGenerate.push(nativeLanguage);
    }
    return languagesToGenerate;
  }),
  languagesToGenerateDefinition: overrideMutateDataProperty(
    ({ languagesToGenerate, languagesToGenerateDefinition, supportedLanguages }: LanguagesAddedApplicationProperties) => {
      languagesToGenerate.forEach(lang => {
        if (languagesToGenerateDefinition.some(def => def.languageTag === lang)) {
          return;
        }
        const languageDefinition = findLanguageForTag(lang, supportedLanguages);
        if (!languageDefinition) {
          throw new Error(`Unsupported language to generate: ${lang}`);
        }
        languagesToGenerateDefinition.push(languageDefinition);
      });
      return languagesToGenerateDefinition;
    },
  ),
  enableI18nRTL: ({ nativeLanguageDefinition, languagesDefinition }: LanguagesAddedApplicationProperties) =>
    nativeLanguageDefinition.rtl || languagesDefinition.some(lang => lang.rtl),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Application>, LanguagesPreparingAddedApplicationProperties>;

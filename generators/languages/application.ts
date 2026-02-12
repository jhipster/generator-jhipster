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

import { type Language, findLanguageForTag, supportedLanguages as defaultSupportedLanguages } from './support/languages.ts';
import type { Application } from './types.ts';

export type LanguagesLoadingAddedApplicationProperties = {
  supportedLanguages: Language[];
  languages: string[];
  languagesToGenerate: string[];
  addLanguageCallbacks: ((mewLanguages: readonly Language[], allLanguages: readonly Language[]) => void)[];
};

export type LanguagesPreparingAddedApplicationProperties = {
  enableTranslation: boolean;
  enableI18nRTL: boolean;
  nativeLanguage: string;
  nativeLanguageDefinition: Language;
  languagesDefinition: readonly Language[];
  languagesToGenerateDefinition: readonly Language[] | undefined;
};

export type LanguagesAddedApplicationProperties = LanguagesLoadingAddedApplicationProperties & LanguagesPreparingAddedApplicationProperties;

export const mutateApplicationLoading = {
  __override__: false,

  supportedLanguages: overrideMutateDataProperty(({ supportedLanguages }: LanguagesAddedApplicationProperties) => {
    supportedLanguages ??= [];
    supportedLanguages.push(...defaultSupportedLanguages);
    return supportedLanguages;
  }),
  languages: overrideMutateDataProperty(({ languages }: LanguagesAddedApplicationProperties) => {
    languages ??= [];
    if (languages.length === 0) {
      languages.push('en');
    }
    return languages;
  }),
  addLanguageCallbacks: () => [],
  languagesToGenerate: () => [],
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<LanguagesAddedApplicationProperties>,
  LanguagesLoadingAddedApplicationProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,
  enableTranslation: false,
  nativeLanguage: 'en',
  nativeLanguageDefinition: ({ nativeLanguage, supportedLanguages }) => findLanguageForTag(nativeLanguage, supportedLanguages)!,
  languagesDefinition: data => data.languages.map(lang => findLanguageForTag(lang, data.supportedLanguages)!).filter(lang => lang),
  languagesToGenerate: overrideMutateDataProperty(({ commandName, languagesToGenerate, nativeLanguage }: Application) => {
    if (languagesToGenerate.length === 0 && commandName !== 'languages') {
      if (!nativeLanguage) {
        throw new Error('A native language must be defined to generate languages');
      }
      languagesToGenerate.push(nativeLanguage);
    }
    return languagesToGenerate;
  }),
  languagesToGenerateDefinition: data => data.languagesToGenerate?.map?.(lang => findLanguageForTag(lang, data.supportedLanguages)!),
  enableI18nRTL: data => data.nativeLanguageDefinition.rtl || data.languagesDefinition?.some(lang => lang.rtl),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Application>, LanguagesPreparingAddedApplicationProperties>;

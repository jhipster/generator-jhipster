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
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import type { Application as JavascriptApplication } from '../javascript/types.ts';

import { type Language, findLanguageForTag, supportedLanguages } from './support/languages.ts';

export type LanguagesAddedApplicationProperties = {
  supportedLanguages: Language[];
  enableTranslation: boolean;
  i18nDir: string;
  enableI18nRTL: boolean;
  nativeLanguage: string;
  nativeLanguageDefinition: Language;
  languages: string[];
  languagesDefinition: readonly Language[];
  languagesToGenerate: string[] | undefined;
  languagesToGenerateDefinition: readonly Language[] | undefined;
  addLanguageCallbacks: ((mewLanguages: readonly Language[], allLanguages: readonly Language[]) => void)[];
};

export const mutateApplication = {
  __override__: false,
  supportedLanguages: [...supportedLanguages],
  enableTranslation: false,
  nativeLanguage: 'en',
  nativeLanguageDefinition: ({ nativeLanguage, supportedLanguages }) => findLanguageForTag(nativeLanguage, supportedLanguages)!,
  languages: () => [],
  languagesDefinition: data => data.languages.map(lang => findLanguageForTag(lang, data.supportedLanguages)!).filter(lang => lang),
  // TODO rename to clientI18nDir and move to client
  i18nDir: data => `${(data as unknown as JavascriptApplication).clientSrcDir}i18n/`,
  addLanguageCallbacks: () => [],
  enableI18nRTL: data => data.nativeLanguageDefinition.rtl || data.languagesDefinition.some(lang => lang.rtl),
  languagesToGenerate: () => undefined,
  languagesToGenerateDefinition: data => data.languagesToGenerate?.map?.(lang => findLanguageForTag(lang, data.supportedLanguages)!),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<LanguagesAddedApplicationProperties>,
  LanguagesAddedApplicationProperties
>;

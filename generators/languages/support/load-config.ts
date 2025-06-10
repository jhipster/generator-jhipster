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
import type { I18nApplication, Entity as LanguagesEntity } from '../types.js';
import { type Language, supportedLanguages as baseSupportedLanguages, findLanguageForTag } from './languages.js';

/**
 * Load translation config into application
 */
export default function loadConfig({
  application,
  config,
  control = {},
}: {
  application: I18nApplication<LanguagesEntity>;
  config: any;
  control?: any;
}) {
  const { supportedLanguages = baseSupportedLanguages } = control;
  application.enableTranslation = config.enableTranslation;
  application.nativeLanguage = config.nativeLanguage;
  const nativeLanguageDefinition = findLanguageForTag(config.nativeLanguage, supportedLanguages);
  if (!nativeLanguageDefinition) {
    throw new Error(`Native language ${config.nativeLanguage} does not exist`);
  }
  application.nativeLanguageDefinition = nativeLanguageDefinition;
  if (application.enableTranslation) {
    application.languages = config.languages;
    application.languagesDefinition = application.languages
      .map(lang => findLanguageForTag(lang, supportedLanguages))
      .filter(lang => lang) as Language[];
    application.enableI18nRTL = (application.languagesDefinition ?? [application.nativeLanguageDefinition]).some(language => language.rtl);
  } else {
    application.enableI18nRTL = application.nativeLanguageDefinition.rtl;
  }
}

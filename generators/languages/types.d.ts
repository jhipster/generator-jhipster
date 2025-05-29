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
import type { Simplify } from 'type-fest';
import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/index.js';
import type { BaseApplicationOptions } from '../base-application/index.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { Language } from './support/languages.js';

export type LanguagesSource = {
  addEntityTranslationKey: (arg: { translationKey: string; translationValue: string; language: string }) => void;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type I18nApplication = ExportApplicationPropertiesFromCommand<typeof import('./command.ts').default> & {
  translations: [];
  enableTranslation: boolean;
  enableI18nRTL: boolean;
  nativeLanguage: string;
  nativeLanguageDefinition: Language;
  languages: string[];
  languagesDefinition: readonly Language[];
};

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type LanguagesOptions = ExportGeneratorOptionsFromCommand<typeof import('./command.js').default> & BaseApplicationOptions;

// FIXME types should extends BaseApplicationConfiguration

export type LanguagesConfiguration = ApplicationConfiguration &
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Simplify<ExportStoragePropertiesFromCommand<typeof import('./command.js').default>>;

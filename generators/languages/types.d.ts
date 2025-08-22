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

import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from '../base-application/types.d.ts';
import type { Application as JavascriptApplication } from '../javascript/types.ts';

import type command from './command.ts';
import type { Language } from './support/languages.ts';

type Command = HandleCommandTypes<typeof command>;

export type Config = BaseApplicationConfig & Command['Config'];

export type Options = BaseApplicationOptions & Omit<Command['Options'], 'languages' | 'languagesDefinition'>;

export type Source = BaseApplicationSource & {
  addEntityTranslationKey: (arg: { translationKey: string; translationValue: string; language: string }) => void;
};

export type Application<E extends BaseApplicationEntity = BaseApplicationEntity> = BaseApplicationApplication<E> &
  JavascriptApplication &
  Omit<Command['Application'], 'languages' | 'languagesDefinition'> & {
    enableTranslation: boolean;
    enableI18nRTL: boolean;
    nativeLanguage: string;
    nativeLanguageDefinition: Language;
    languages: string[];
    languagesDefinition: readonly Language[];
    i18nDir: string;
  };

export * from './entity.ts';

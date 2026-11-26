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
import type { GetWebappTranslationCallback } from '../../../client/translation.d.ts';
import type { Language } from '../../support/languages.ts';

import type { TranslationConditions } from './support/translation-file.ts';

/** The translation files of each language, loaded from the folder of the language in the templates folders. */
export type TranslationFiles = {
  /** The templates folders of the generator, of its blueprints first. */
  templatesFolders: string[];
  /** The folder of the files of a language in the templates folders: a template `<file>.json.ejs` is rendered, a JSON file read. */
  folder: (languageTag: string) => string;
  /** The names the texts take, written `{name}`. */
  names?: Record<string, string>;
  /** The conditions of the keys of each file, by its name and their path, given the context. */
  conditions?: Record<string, TranslationConditions<any>>;
  /** The context of the conditions and of a template. */
  context?: Record<string, any>;
};

export type Application = {
  /** The translations of the native language, English as their fallback, read from the translation files. */
  translations: Record<string, any>;
  /** The translation of a key, with the values of its placeholders. */
  getWebappTranslation?: GetWebappTranslationCallback;
  /**
   * Adds a translation file of a language: written to its destination when the application is translated, else read
   * without a file when it is the native language or English, its fallback.
   */
  addTranslation: (arg: { languageTag: string; destinationFile: string; translation: Record<string, any> }) => void;
  /** The languages translated: the languages of the application when it is translated, else its native language and English. */
  translationLanguages: Language[];
  /**
   * Loads the translation files of each of the translated languages, all of them, into the translations of the native
   * language and English, its fallback; the ones the application writes are written by writeTranslationFiles.
   */
  loadTranslationFiles: (files: TranslationFiles) => void;
  /** Writes loaded translation files of each of the translated languages, when the application is translated. */
  writeTranslationFiles: (arg: { files: string[]; destinationFile: (languageTag: string, file: string) => string }) => void;
};

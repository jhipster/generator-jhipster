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
};

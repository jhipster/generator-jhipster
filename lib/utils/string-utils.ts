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
import { lowerFirst } from 'lodash-es';
import pluralizeString from 'pluralize';

export function customCamelCase(string: string): string {
  checkStringIsValid(string);
  if (string === '') {
    return string;
  }
  return lowerFirst(string.replace(/[\W_]/g, ''));
}

function checkStringIsValid(string: string) {
  if (string == null) {
    throw new Error('The passed string cannot be nil.');
  }
}

/**
 * Pluralizes a string. If the plural is the same as the singular, it adds an "s" or "es" suffix at the end of the string to avoid conflicts.
 */
export function pluralize(string: string, { force }: { force: boolean }): string {
  const plural = pluralizeString(string);
  if (plural === string && force) {
    return string.endsWith('s') ? `${string}es` : `${string}s`;
  }
  return plural;
}

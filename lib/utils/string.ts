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

import { camelCase, upperFirst } from 'lodash-es';

/**
 * Calculate a hash code for a given string.
 * @param str - any string
 * @returns returns the calculated hash code.
 */
export function stringHashCode(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash |= 0;
  }

  if (hash < 0) {
    hash *= -1;
  }
  return hash;
}

/**
 * get the an upperFirst camelCase value.
 * @param value string to convert
 */
export function upperFirstCamelCase(value: string): string {
  return upperFirst(camelCase(value));
}

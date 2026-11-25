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

const filterNullishValues = (value: unknown): boolean => value != null;

/**
 * Copy and remove null and undefined values
 * @param object
 */

export function removeFieldsWithNullishValues<const T extends Record<string, any>>(object: T): T {
  return filterValue(object, filterNullishValues);
}

/**
 * Copy and remove null and undefined values
 * @param object
 */

function filterValue<const T extends Record<string, any>>(
  object: T,
  customFilterValue: (arg: unknown) => boolean = filterNullishValues,
  deep = 1,
): T {
  const clone: Record<string, any> = {};
  for (const [key, value] of Object.entries(object)) {
    if (customFilterValue(value)) {
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          clone[key] = value.filter(customFilterValue);
        } else if (deep < 4) {
          // Avoid recursion depth issues
          clone[key] = filterValue(value, customFilterValue, deep + 1);
        }
      } else {
        clone[key] = value;
      }
    }
  }
  return clone as T;
}

/**
 * Picks every field from source.
 * A field with undefined value is returned for missing fields.
 */
export const pickFields = (source: Record<string | number, any>, fields: (string | number)[]) =>
  Object.fromEntries(fields.map(field => [field, source[field]]));

export * from './mutate-data/index.ts';

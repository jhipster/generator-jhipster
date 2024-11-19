/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

const filterNullishValues = value => value !== undefined && value !== null;

/**
 * Copy and remove null and undefined values
 * @param object
 * @returns
 */

export function removeFieldsWithNullishValues<const T extends Record<string, any>>(object: T): T {
  return filterValue(object, filterNullishValues);
}

/**
 * Copy and remove null and undefined values
 * @param object
 * @returns
 */

function filterValue<const T extends Record<string, any>>(object: T, filterValue: (any) => boolean = filterNullishValues): T {
  const clone = {};
  for (const [key, value] of Object.entries(object)) {
    if (filterValue(value)) {
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          clone[key] = value.filter(filterValue);
        } else {
          clone[key] = removeFieldsWithNullishValues(value);
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

/**
 * Mutation properties accepts:
 * - functions: receives the application and the return value is set at the application property.
 * - non functions: application property will receive the property in case current value is undefined.
 *
 * Applies each mutation object in order.
 *
 * @example
 * // application = { prop: 'foo-bar', prop2: 'foo2' }
 * mutateData(
 *   data,
 *   { prop: 'foo', prop2: ({ prop }) => prop + 2 },
 *   { prop: ({ prop }) => prop + '-bar', prop2: 'won\'t override' },
 * );
 */
export const mutateData = (
  context: Record<string | number, any>,
  ...mutations: (Record<string | number, any> & {
    /** Set to false if you don't want functions to override the value */
    __override__?: boolean;
  })[]
) => {
  for (const mutation of mutations) {
    const override = mutation.__override__;
    for (const [key, value] of Object.entries(mutation).filter(([key]) => key !== '__override__')) {
      if (typeof value === 'function') {
        if (override !== false || context[key] === undefined) {
          context[key] = value(context);
        }
      } else if (context[key] === undefined || override === true) {
        context[key] = value;
      }
    }
  }
};

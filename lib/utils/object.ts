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

import type { OmitIndexSignature, Simplify } from 'type-fest';

const filterNullishValues = (value: unknown): boolean => value !== undefined && value !== null;

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
        } else {
          if (deep < 4) {
            // Avoid recursion depth issues
            clone[key] = filterValue(value, customFilterValue, deep + 1);
          }
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
 * - functions: receives the data and the return value is set at the data property.
 * - non functions: data property will receive the property in case current value is undefined.
 * - __override__ property: if set to false, functions will not override existing values.
 *
 * Applies each mutation object in order.
 *
 * Note: if data property is expected to be a function, mutation should be a function that returns the desired function.
 *
 * @example
 * // data = { prop: 'foo-bar', prop2: 'foo2', fn: () => 'fn' }
 * mutateData(
 *   data,
 *   { prop: 'foo', prop2: ({ prop }) => prop + 2, fn: () => () => 'fn' },
 *   { prop: ({ prop }) => prop + '-bar', prop2: 'won\'t override' },
 *   { __override__: false, prop: () => 'won\'t override' },
 * );
 */
export const mutateData = <const T extends Record<string | number, any>>(
  context: T,
  ...mutations: Simplify<
    OmitIndexSignature<{
      [Key in keyof (Partial<T> & { __override__?: boolean })]?: Key extends '__override__'
        ? boolean
        : Key extends keyof T
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            T[Key] extends Function
            ? (ctx: T) => T[Key]
            : T[Key] | ((ctx: T) => T[Key])
          : never;
    }>
  >[]
) => {
  for (const mutation of mutations) {
    const override = mutation.__override__;
    for (const [key, value] of Object.entries(mutation).filter(([key]) => key !== '__override__')) {
      if (typeof value === 'function') {
        if (override !== false || context[key] === undefined) {
          (context as any)[key] = value(context);
        }
      } else if (context[key] === undefined || override === true) {
        (context as any)[key] = value;
      }
    }
  }
};

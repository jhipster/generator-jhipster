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

import type { OmitIndexSignature, ReadonlyKeysOf, RequiredKeysOf, SetRequired, Simplify } from 'type-fest';

const filterNullishValues = (value: unknown): boolean => value != null;

const MUTATION_CONTEXT_SYMBOL = '__MutationContext__';

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

export const DelayedMutation = '__DelayedMutation__';
export type MutateDataCallbackOptions = {
  /** Marker to be returned when a property needs to be delayed */
  delayMarker?: typeof DelayedMutation;
};

export type MutateDataParam<T extends object> = Simplify<
  OmitIndexSignature<{
    [Key in keyof (T & { __override__?: boolean })]?: Key extends '__override__' ? boolean
    : Key extends ReadonlyKeysOf<T> ? never
    : Key extends keyof T ?
      T[Key] extends Function ?
        (ctx: T, opts: MutateDataCallbackOptions) => T[Key] | typeof DelayedMutation
      : T[Key] | ((ctx: T, opts: MutateDataCallbackOptions) => T[Key] | typeof DelayedMutation)
    : never;
  }>
>;

/**
 * Utility to ensure required mutation properties are set.
 */
export type MutateDataPropertiesWithRequiredProperties<D extends Record<string, any>, N extends Record<string, any>> = SetRequired<
  D,
  RequiredKeysOf<N>
>;

const OverrideMutation = Symbol('OverrideMutation');

export type MutateDataFunction = ((ctx: any, opts: MutateDataCallbackOptions) => any) & { [OverrideMutation]?: boolean };
type MutationContextOptions = {
  autoDelay?: boolean;
  delayContext: Record<string, MutateDataFunction[]>;
};
type ContextWithMutationOptions<T extends object = object> = T & { [MUTATION_CONTEXT_SYMBOL]: MutationContextOptions };

export const overrideMutateDataProperty = <const T extends MutateDataFunction>(fn: T): T => {
  fn[OverrideMutation] = true;
  return fn;
};

export const dontOverrideMutateDataProperty = <const T extends MutateDataFunction>(fn: T): T => {
  fn[OverrideMutation] = false;
  return fn;
};

class PropertyNotYetDefinedError extends Error {
  constructor(property: string) {
    super(`Property ${property} is not defined yet`);
    this.name = 'PropertyNotYetDefinedError';
  }
}

export const createDelayedMutationContext = <T extends object>(options: Omit<MutationContextOptions, 'delayContext'> = {}): T => {
  const context: T = {} as T;
  (context as ContextWithMutationOptions<typeof context>)[MUTATION_CONTEXT_SYMBOL] = { ...options, delayContext: {} };
  return context;
};

const isMutationContext = <T extends object>(context: T): context is ContextWithMutationOptions<T> => {
  return context && typeof context === 'object' && MUTATION_CONTEXT_SYMBOL in context && context[MUTATION_CONTEXT_SYMBOL] !== undefined;
};

const createNotYetDefinedProxy = (target: Record<string | number, any>): any =>
  new Proxy(target, {
    get: (obj: any, prop) => {
      if (prop in obj) {
        return obj[prop];
      }
      throw new PropertyNotYetDefinedError(prop.toString());
    },
  });

const handleMutateDataCallback = (fn: MutateDataFunction, context: any, { defaults }: { defaults?: boolean }): any => {
  const mutationContext = isMutationContext(context);
  const { autoDelay = false } = mutationContext ? (context[MUTATION_CONTEXT_SYMBOL] ?? {}) : {};
  try {
    return fn(
      autoDelay ? createNotYetDefinedProxy(context) : context,
      mutationContext && !defaults ? { delayMarker: DelayedMutation } : {},
    );
  } catch (error) {
    if (error instanceof PropertyNotYetDefinedError) {
      return DelayedMutation;
    }
    throw error;
  }
};

const applyDelayedMutations = (
  context: ContextWithMutationOptions<object>,
  opts?: { defaults?: boolean; throwOnDelay?: boolean },
): boolean => {
  let mutationApplied = false;
  const delayedContext = context[MUTATION_CONTEXT_SYMBOL].delayContext;
  if (delayedContext) {
    const { defaults = true, throwOnDelay = false } = opts || {};
    for (const [key, value] of Object.entries(delayedContext)) {
      if (key in context && (context as any)[key] !== undefined) {
        delete delayedContext[key];
      } else {
        let result = undefined;
        for (const fn of value) {
          result = handleMutateDataCallback(fn, context, { defaults });
          if (result !== DelayedMutation && result !== undefined) {
            break;
          }
        }
        if (result === DelayedMutation) {
          if (throwOnDelay) {
            throw new Error(
              `Mutation for key ${key} is still delayed, passing defaults should return an valid value instead of Delay Symbol`,
            );
          }
          continue;
        } else if (result === undefined) {
          if (throwOnDelay) {
            throw new Error(`Mutation for key ${key} is undefined, passing defaults should return an valid value`);
          }
        }
        delete delayedContext[key];
        (context as any)[key] = result;
        mutationApplied = true;
      }
    }
  }
  return mutationApplied;
};

export const finalizeMutations = (context: any): void => {
  if (isMutationContext(context)) {
    while (applyDelayedMutations(context, { defaults: true })) {
      // Apply mutations until there is no more mutation to apply, this is to handle mutations that depend on other mutations.
    }
    context[MUTATION_CONTEXT_SYMBOL].autoDelay = false;
    // In case there is still delayed mutations, it means that some required properties are missing, we throw an error to avoid silent issues.
    applyDelayedMutations(context, { defaults: true, throwOnDelay: true });
    delete context[MUTATION_CONTEXT_SYMBOL];
  }
};

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
export function mutateData<T extends Record<string | number, any>>(
  context: T,
  ...mutations: (MutateDataParam<T> | ((data: T) => MutateDataParam<T>))[]
): void {
  if (typeof context !== 'object' || context === null || Array.isArray(context)) {
    throw new Error('Context should be a non null and non array object');
  }

  for (let mutation of mutations) {
    if (typeof mutation === 'function') {
      mutation = mutation(context);
    }
    const override = mutation.__override__;
    const mutationEntries = Object.entries(mutation).filter(([key]) => key !== '__override__');
    if (mutationEntries.length === 0) {
      continue;
    }
    for (const [key, value] of mutationEntries) {
      if (typeof value === 'function') {
        if (
          (override !== false && value[OverrideMutation] !== false) ||
          !(key in context) ||
          context[key] === undefined ||
          value[OverrideMutation] === true
        ) {
          const result = handleMutateDataCallback(value, context, { defaults: false });
          if (result === DelayedMutation) {
            if (isMutationContext(context)) {
              const delayed = (context[MUTATION_CONTEXT_SYMBOL].delayContext[key] ??= []);
              // Last mutation should take precedence.
              delayed.unshift(value);
            } else {
              throw new Error(`Context should be a mutation context to use delayed mutations, missing context for key: ${key}`);
            }
          } else {
            (context as any)[key] = result;
          }
        }
      } else if (!(key in context) || context[key] === undefined || override === true) {
        (context as any)[key] = value;
      }
    }

    if (isMutationContext(context)) {
      applyDelayedMutations(context, { defaults: false });
    }
  }
}

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

import { isMutationContext } from './context.ts';
import { DelayedMutation, MUTATION_CONTEXT_SYMBOL, OverrideMutation, UndefinedMutation } from './markers.ts';
import type { ContextWithMutationOptions, MutateDataFunction, MutateDataParam } from './types.ts';

/**
 * Thrown by a delayed mutation reading a property not defined yet, and caught by `handleMutateDataCallback`. Not an
 * Error: a stack trace would be captured for each delayed mutation.
 */
class PropertyNotYetDefined {
  readonly property: string;

  constructor(property: string) {
    this.property = property;
  }
}

const createNotYetDefinedProxy = (target: Record<string | number, any>): any =>
  new Proxy(target, {
    get: (obj: any, prop) => {
      if (prop in obj) {
        return obj[prop];
      }
      throw new PropertyNotYetDefined(prop.toString());
    },
  });

/**
 * Calls a mutation. While finalizing, the mutation gets no delay marker: it computes its value.
 */
const handleMutateDataCallback = (
  fn: MutateDataFunction,
  context: any,
  { finalizing, key }: { finalizing?: boolean; key: string },
): any => {
  const mutationContext = isMutationContext(context);
  const { autoDelay = false } = mutationContext ? (context[MUTATION_CONTEXT_SYMBOL] ?? {}) : {};
  try {
    return fn(
      autoDelay ? createNotYetDefinedProxy(context) : context,
      mutationContext && !finalizing ?
        { delayMarker: DelayedMutation, undefinedMarker: UndefinedMutation, data: context }
      : { undefinedMarker: UndefinedMutation, data: context },
    );
  } catch (error) {
    if (error instanceof PropertyNotYetDefined) {
      if (mutationContext) {
        (context[MUTATION_CONTEXT_SYMBOL].waitingFor ??= {})[key] = error.property;
      }
      return DelayedMutation;
    }
    throw error;
  }
};

/** The property a delayed mutation waited for, to tell in an error. */
const waitedFor = (context: ContextWithMutationOptions, key: string): string => {
  const property = context[MUTATION_CONTEXT_SYMBOL].waitingFor?.[key];
  return property ? ` (it waited for ${property})` : '';
};

const applyDelayedMutations = (
  context: ContextWithMutationOptions,
  opts?: { finalizing?: boolean; throwOnDelay?: boolean; waitForDelayed?: boolean },
): boolean => {
  let mutationApplied = false;
  const delayedContext = context[MUTATION_CONTEXT_SYMBOL].delayContext;
  if (delayedContext) {
    const { finalizing = true, throwOnDelay = false, waitForDelayed = false } = opts ?? {};
    for (const [key, value] of Object.entries(delayedContext)) {
      // A mutation overriding the property waits for what it reads, the value set meanwhile does not take its place.
      if (key in context && (context as any)[key] !== undefined && !value.some(fn => fn[OverrideMutation] === true)) {
        delete delayedContext[key];
        const { onDroppedMutation, waitingFor } = context[MUTATION_CONTEXT_SYMBOL];
        onDroppedMutation?.({ key, waitingFor: waitingFor?.[key], value: (context as any)[key] });
        delete waitingFor?.[key];
      } else {
        let result = undefined;
        for (const fn of value) {
          result = handleMutateDataCallback(fn, context, { finalizing, key });
          if (
            (result !== DelayedMutation && result !== undefined) ||
            // A mutation waiting for a pending property does not give way to one of the same key registered before it.
            (result === DelayedMutation && waitForDelayed)
          ) {
            break;
          }
        }
        if (result === DelayedMutation) {
          if (throwOnDelay) {
            throw new Error(
              `The delayed mutation of ${key} is still delayed${waitedFor(context, key)}: once finalizing, it must return a value instead of the delay marker`,
            );
          }
          continue;
        } else if (result === undefined) {
          if (throwOnDelay) {
            throw new Error(
              `The delayed mutation of ${key} returned undefined${waitedFor(context, key)}: once finalizing, it must return a value, or the undefined marker to leave it undefined`,
            );
          }
        } else if (result === UndefinedMutation) {
          result = undefined;
        }
        delete delayedContext[key];
        delete context[MUTATION_CONTEXT_SYMBOL].waitingFor?.[key];
        (context as any)[key] = result;
        mutationApplied = true;
      }
    }
  }
  return mutationApplied;
};

export const finalizeMutations = (context: any): void => {
  if (isMutationContext(context)) {
    const options = context[MUTATION_CONTEXT_SYMBOL];
    // Without autoDelay (an entity, a field, a relationship), it is turned on while finalizing: a mutation reading a
    // property still pending waits for it, whichever was declared first.
    const waitForDelayed = !options.autoDelay;
    options.autoDelay = true;
    while (applyDelayedMutations(context, { finalizing: true, waitForDelayed })) {
      // Apply mutations until there is no more mutation to apply, this is to handle mutations that depend on other mutations.
    }
    // The ones still delayed wait for each other, or for a property not set: computed with it undefined.
    options.autoDelay = false;
    // In case there is still delayed mutations, it means that some required properties are missing, we throw an error to avoid silent issues.
    applyDelayedMutations(context, { finalizing: true, throwOnDelay: true });
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
          const result = handleMutateDataCallback(value, context, { finalizing: false, key });
          if (result === DelayedMutation) {
            if (isMutationContext(context)) {
              const delayed = (context[MUTATION_CONTEXT_SYMBOL].delayContext[key] ??= []);
              // Last mutation should take precedence.
              delayed.unshift(value);
            } else {
              throw new Error(`Context should be a mutation context to use delayed mutations, missing context for key: ${key}`);
            }
          } else {
            (context as any)[key] = result === UndefinedMutation ? undefined : result;
          }
        }
      } else if (!(key in context) || context[key] === undefined || override === true) {
        (context as any)[key] = value;
      }
    }

    if (isMutationContext(context)) {
      applyDelayedMutations(context, { finalizing: false });
    }
  }
}

/**
 * Applies the mutations as defaults: like `mutateData` with `__override__: false`, a property already set is kept, unless
 * a mutation sets `__override__` itself or its function is marked by `overrideMutateDataProperty`. A mutation given as a
 * function, as `mutateData` takes, is called with the data when it is reached.
 */
export function mutateDefaults<T extends Record<string | number, any>>(
  context: T,
  ...mutations: (MutateDataParam<T> | ((data: T) => MutateDataParam<T>))[]
): void {
  mutateData(
    context,
    ...mutations.map(mutation =>
      typeof mutation === 'function' ? (data: T) => ({ __override__: false, ...mutation(data) }) : { __override__: false, ...mutation },
    ),
  );
}

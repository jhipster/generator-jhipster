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

import { MUTATION_CONTEXT_SYMBOL } from './markers.ts';
import type { ContextWithMutationOptions, MutationContextOptions } from './types.ts';

export const isMutationContext = <T extends object>(context: T): context is ContextWithMutationOptions<T> =>
  context && typeof context === 'object' && MUTATION_CONTEXT_SYMBOL in context && context[MUTATION_CONTEXT_SYMBOL] !== undefined;

/**
 * Makes an object a mutation context: a mutation may then return the delay marker, and `finalizeMutations` applies the
 * delayed ones. The context is not enumerable, so copies of the object do not share it. An object already a mutation
 * context is kept as it is.
 */
export const enableDelayedMutations = <T extends object>(
  data: T,
  options: Omit<MutationContextOptions, 'delayContext' | 'waitingFor'> = {},
): T => {
  if (!isMutationContext(data)) {
    Object.defineProperty(data, MUTATION_CONTEXT_SYMBOL, {
      value: { ...options, delayContext: {} },
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }
  return data;
};

/**
 * Creates an empty mutation context, as `enableDelayedMutations` makes one of an existing object.
 */
export const createDelayedMutationContext = <T extends object>(
  options: Omit<MutationContextOptions, 'delayContext' | 'waitingFor'> = {},
): T => enableDelayedMutations({} as T, options);

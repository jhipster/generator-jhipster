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

import type { IsEqual, KeysOfUnion, OmitIndexSignature, ReadonlyKeysOf, RequiredKeysOf, SetRequired, Simplify } from 'type-fest';

import type { DelayedMutation, MUTATION_CONTEXT_SYMBOL, OverrideMutation, UndefinedMutation } from './markers.ts';

export type MutateDataCallbackOptions<Data extends object> = {
  /** Marker to be returned when a property needs to be delayed */
  delayMarker?: typeof DelayedMutation;
  undefinedMarker: typeof UndefinedMutation;
  data: Data;
};

export type MutateDataParam<T extends object> = Simplify<
  OmitIndexSignature<{
    [Key in keyof (T & { __override__?: boolean })]?: Key extends '__override__' ? boolean
    : Key extends ReadonlyKeysOf<T> ? never
    : Key extends keyof T ?
      T[Key] extends (...args: any[]) => any ?
        (ctx: T, opts: MutateDataCallbackOptions<T>) => T[Key] | typeof DelayedMutation | typeof UndefinedMutation
      : T[Key] | ((ctx: T, opts: MutateDataCallbackOptions<T>) => T[Key] | typeof DelayedMutation | typeof UndefinedMutation)
    : never;
  }> &
    // A record, like the scripts of package.json, takes any key of its values, a function value through a callback only.
    // An index signature cannot leave `__override__` out, so a boolean is accepted for every key.
    // A readonly record takes no key, and a record of `any` values checks none.
    (string extends keyof T ?
      [keyof OmitIndexSignature<T>] extends [never] ?
        IsEqual<T, Readonly<T>> extends true ?
          unknown
        : Record<
            string,
            | boolean
            | (T[string] extends (...args: any[]) => any ? never : T[string])
            | ((ctx: T, opts: MutateDataCallbackOptions<T>) => T[string] | typeof DelayedMutation | typeof UndefinedMutation)
          >
      : unknown
    : unknown)
>;

/**
 * Utility to ensure required mutation properties are set.
 */
export type MutateDataPropertiesWithRequiredProperties<D extends Record<string, any>, N extends Record<string, any>> = SetRequired<
  D,
  Extract<RequiredKeysOf<N>, KeysOfUnion<D>>
>;

export type MutateDataFunction<Data extends object = any> = ((ctx: Data, opts: MutateDataCallbackOptions<Data>) => any) & {
  [OverrideMutation]?: boolean;
};

export type DroppedMutation = {
  /** The key of the delayed mutation. */
  key: string;
  /** The property the mutation was waiting for, not defined yet when it was tried. */
  waitingFor?: string;
  /** The value another mutation set first, which is kept. */
  value: unknown;
};

export type MutationContextOptions = {
  autoDelay?: boolean;
  /** Called when a delayed mutation is dropped because another mutation defined its key first. */
  onDroppedMutation?: (dropped: DroppedMutation) => void;
  delayContext: Record<string, MutateDataFunction[]>;
  /** The property each delayed mutation was waiting for. */
  waitingFor?: Record<string, string>;
};

export type ContextWithMutationOptions<T extends object = object> = T & { [MUTATION_CONTEXT_SYMBOL]: MutationContextOptions };

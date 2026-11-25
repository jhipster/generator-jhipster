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

import { type DelayedMutation, OverrideMutation, type UndefinedMutation } from './markers.ts';
import type { DroppedMutation, MutateDataFunction } from './types.ts';

/** A message telling that a delayed mutation was dropped, for a debug log. */
export const droppedMutationMessage = ({ key, waitingFor, value }: DroppedMutation): string =>
  `The delayed default of ${key} was dropped: ${waitingFor ? `it waited for ${waitingFor}, and ` : ''}another mutation set ${key} (${JSON.stringify(value)}) first.`;

export const overrideMutateDataProperty = <const T extends MutateDataFunction>(fn: T): T => {
  fn[OverrideMutation] = true;
  return fn;
};

export const dontOverrideMutateDataProperty = <const T extends MutateDataFunction>(fn: T): T => {
  fn[OverrideMutation] = false;
  return fn;
};

/**
 * A mutation computed once the data is prepared, not when it is set: in a mutation context (the defaults of an application,
 * an entity, a field or a relationship) it returns the delay marker first, and `finalizeMutations` computes it, the
 * properties set after it (a field or a relationship prepared later) available then. Without a mutation context, a plain
 * `mutateData` call, it is computed at once. A context with `autoDelay` (the application at loading) also delays, implicitly,
 * a mutation reading a property not set yet: that property stays undefined until `finalizeMutations`. `finalizeMutations`
 * computes a mutation reading the property of another delayed mutation after that one, whichever was declared first. The type of the
 * data is the one of the parameter of `compute`, not the one of the mutation: annotate it to read the data, so a
 * declaration file gives its name rather than the whole type of the mutation.
 * @example
 * entityDefaults({
 *   requiredRelationships: finalizeDefault(({ relationships }: Entity) => relationships.filter(rel => rel.relationshipRequired)),
 * });
 */
export const finalizeDefault =
  <Data extends object, Value>(compute: (data: Data) => Value) =>
  (data: NoInfer<Data>, { delayMarker }: { delayMarker?: typeof DelayedMutation }): Value | typeof DelayedMutation =>
    delayMarker ?? compute(data);

/**
 * Like `finalizeDefault`, but an undefined value is final: the property is left undefined, while with `finalizeDefault` a
 * delayed mutation returning undefined gives way to the mutation registered before it for the same property (a default of
 * JHipster under a default of a blueprint).
 */
export const finalizeDefaultOrUndefined =
  <Data extends object, Value>(compute: (data: Data) => Value | undefined) =>
  (
    data: NoInfer<Data>,
    { delayMarker, undefinedMarker }: { delayMarker?: typeof DelayedMutation; undefinedMarker: typeof UndefinedMutation },
  ): Value | typeof DelayedMutation | typeof UndefinedMutation =>
    delayMarker ?? compute(data) ?? undefinedMarker;

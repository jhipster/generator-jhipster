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

import {
  type GeneratorsStore,
  createGeneratorMetaLookup,
  getJHipsterStore,
  lookupGeneratorCommands,
} from '../resolver/generator-commands.ts';
import { mergeDependenciesConfigs, resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';

import type { JHipsterConfig, JHipsterConfigs } from './types.ts';

// By store, as what a namespace resolves to - blueprints included - is a property of the store.
const cache = new WeakMap<GeneratorsStore, Map<string, JHipsterConfigs>>();

/**
 * The configs contributed by the generators of a store: with `from`, the roots and their `import`s resolved
 * recursively, the same dependency graph `jhipster describe` and the cli walk, which costs the handful of generators
 * those roots depend on; without it, every jhipster generator registered.
 *
 * Without a `store`, that is a store with only the jhipster generators, so blueprints contribute only when the caller
 * passes the store they are registered in - the one of the environment builder - along with their `blueprintNamespaces`.
 */
export const lookupCommandsConfigs = async (options?: {
  from?: string[];
  filter?: (config: JHipsterConfig) => boolean;
  store?: GeneratorsStore;
  blueprintNamespaces?: string[];
}): Promise<JHipsterConfigs> => {
  const { from, filter = () => true, blueprintNamespaces = [] } = options ?? {};
  const store = options?.store ?? (await getJHipsterStore());
  if (!cache.has(store)) cache.set(store, new Map());
  const storeCache = cache.get(store)!;
  const key = JSON.stringify([from ?? '*', blueprintNamespaces]);
  if (!storeCache.has(key)) {
    const dependencies =
      from ?
        await resolveGeneratorDependencies(from, { getGeneratorMeta: createGeneratorMetaLookup(store), blueprintNamespaces })
      : await lookupGeneratorCommands({ store });
    storeCache.set(key, Object.fromEntries([...mergeDependenciesConfigs(dependencies)].map(([name, { config }]) => [name, config])));
  }
  return Object.fromEntries(Object.entries(storeCache.get(key)!).filter(([_key, value]) => filter(value)));
};

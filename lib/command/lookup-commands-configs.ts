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

import { createGeneratorCommandsMetaLookup, lookupGeneratorCommands } from '../resolver/generator-commands.ts';
import { mergeDependenciesConfigs, resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';

import type { JHipsterConfig, JHipsterConfigs } from './types.ts';

const cache = new Map<string, JHipsterConfigs>();

/**
 * The configs contributed by generators: with `from`, the roots and their `import`s resolved recursively, the same
 * dependency graph `jhipster describe` and the cli walk, which costs the handful of generators those roots depend on;
 * without it, every generator found.
 */
export const lookupCommandsConfigs = async (options?: {
  from?: string[];
  filter?: (config: JHipsterConfig) => boolean;
}): Promise<JHipsterConfigs> => {
  const { from, filter = () => true } = options ?? {};
  const key = from ? from.join(',') : '*';
  if (!cache.has(key)) {
    const dependencies =
      from ?
        await resolveGeneratorDependencies(from, { getGeneratorMeta: createGeneratorCommandsMetaLookup() })
      : await lookupGeneratorCommands();
    cache.set(key, Object.fromEntries([...mergeDependenciesConfigs(dependencies)].map(([name, { config }]) => [name, config])));
  }
  return Object.fromEntries(Object.entries(cache.get(key)!).filter(([_key, value]) => filter(value)));
};

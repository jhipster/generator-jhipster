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
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { GeneratorMeta } from '@yeoman/types';
import { Store } from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';
import { getPackageRoot } from '../index.ts';
import { customizeNestedNamespace, jhipsterGeneratorsLookup } from '../utils/lookup.ts';

export type GeneratorCommand = {
  namespace: string;
  /** Description from the generator USAGE file, or the one passed to `lookupGeneratorCommands`. */
  description?: string;
  command?: JHipsterCommandDefinition;
};

/** The part of a generators store the lookups need. */
export type GeneratorsStore = Pick<Store, 'getMeta' | 'getGeneratorsMeta'>;

const JHIPSTER_NAMESPACE_PREFIX = 'jhipster:';

/**
 * Read the USAGE file next to a generator file.
 */
export const readUsage = (generatorFile: string): string | undefined => {
  const usagePath = join(dirname(generatorFile), 'USAGE');
  return existsSync(usagePath) ? readFileSync(usagePath, 'utf8').trim() : undefined;
};

const readUsageDescription = (generatorFile: string): string | undefined => {
  const usage = readUsage(generatorFile);
  const description = usage ? /Description:\s*\n([^\n]+)/.exec(usage) : undefined;
  return description?.[1].trim();
};

let jhipsterStore: Promise<Store> | undefined;

/**
 * A store with only the jhipster generators, shared by the lookups that are not given one. It is the store the
 * environment uses, looked up the way the environment builder looks the jhipster generators up, without an environment.
 */
export const getJHipsterStore = (): Promise<Store> => {
  jhipsterStore ??= (async () => {
    const store = new Store();
    store.lookupSync({
      packagePaths: [getPackageRoot()],
      lookups: jhipsterGeneratorsLookup,
      customizeNamespace: customizeNestedNamespace,
    });
    return store;
  })();
  return jhipsterStore;
};

/**
 * The `getGeneratorMeta` of a store for `resolveGeneratorDependencies`, optionally with commands by namespace that
 * stand in for generators that are not registered, like the ones of a blueprint in a test.
 */
export const createGeneratorMetaLookup =
  (store: GeneratorsStore, commands: Record<string, JHipsterCommandDefinition> = {}) =>
  (namespace: string): GeneratorMeta | undefined =>
    (commands[namespace] ? { namespace, importModule: async () => ({ command: commands[namespace] }) } : store.getMeta(namespace)) as
      GeneratorMeta | undefined;

/**
 * Load the jhipster generators registered in the store with their command definition.
 */
export const lookupGeneratorCommands = async ({
  store,
  descriptions = {},
}: { store?: GeneratorsStore; descriptions?: Record<string, string> } = {}): Promise<GeneratorCommand[]> => {
  const generators: GeneratorCommand[] = [];
  // Sorted, so the result does not depend on the order the generators happened to be registered in.
  const metas = Object.values((store ?? (await getJHipsterStore())).getGeneratorsMeta()).sort((a, b) =>
    a.namespace.localeCompare(b.namespace),
  );
  for (const meta of metas) {
    // A generator registered as a class, like the aliases, has no module to import a command from.
    if (!meta.namespace.startsWith(JHIPSTER_NAMESPACE_PREFIX) || !meta.importModule) continue;
    const namespace = meta.namespace.slice(JHIPSTER_NAMESPACE_PREFIX.length);
    const module = (await meta.importModule()) as { command?: JHipsterCommandDefinition };
    generators.push({
      namespace,
      description: descriptions[namespace] ?? (meta.resolved ? readUsageDescription(meta.resolved) : undefined),
      command: module.command,
    });
  }
  return generators;
};

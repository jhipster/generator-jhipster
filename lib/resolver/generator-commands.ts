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

import type { JHipsterCommandDefinition } from '../command/types.ts';

import { type GeneratorsStore, JHIPSTER_NAMESPACE_PREFIX, lookupGeneratorsMeta } from './lookups.ts';

export type { GeneratorsStore } from './lookups.ts';

export type GeneratorCommand = {
  namespace: string;
  /** Description from the generator USAGE file, or the one passed to `lookupGeneratorCommands`. */
  description?: string;
  command?: JHipsterCommandDefinition;
};

/**
 * Read the USAGE file next to a generator file.
 */
export const readUsage = (generatorFile: string): string | undefined => {
  const usagePath = join(dirname(generatorFile), 'USAGE');
  return existsSync(usagePath) ? readFileSync(usagePath, 'utf8').trim() : undefined;
};

let generatorsCache: Promise<GeneratorCommand[]> | undefined;

const readUsageDescription = (generatorFile: string): string | undefined => {
  const usage = readUsage(generatorFile);
  const description = usage ? /Description:\s*\n([^\n]+)/.exec(usage) : undefined;
  return description?.[1].trim();
};

/** The namespace of a generator as the cli names it: without the prefix for the jhipster generators. */
const toCommandNamespace = (namespace: string) =>
  namespace.startsWith(JHIPSTER_NAMESPACE_PREFIX) ? namespace.slice(JHIPSTER_NAMESPACE_PREFIX.length) : namespace;

const loadGeneratorCommands = async (store?: GeneratorsStore): Promise<GeneratorCommand[]> => {
  const generators: GeneratorCommand[] = [];
  for (const meta of lookupGeneratorsMeta(store)) {
    const module = (await meta.importModule!()) as { command?: JHipsterCommandDefinition };
    generators.push({
      namespace: toCommandNamespace(meta.namespace),
      description: readUsageDescription(meta.resolved),
      command: module.command,
    });
  }
  return generators;
};

/**
 * Load the generators of a store with their command definition: the jhipster generators, named without the `jhipster:`
 * prefix, and the others, like blueprints, by their namespace. Defaults to the jhipster generators of this installation.
 */
export const lookupGeneratorCommands = async ({
  store,
  descriptions = {},
}: { store?: GeneratorsStore; descriptions?: Record<string, string> } = {}): Promise<GeneratorCommand[]> => {
  // The store given changes as generators are registered, only the jhipster one is cached.
  const generators = store ? await loadGeneratorCommands(store) : await (generatorsCache ??= loadGeneratorCommands());
  return generators.map(generator => ({
    ...generator,
    description: descriptions[generator.namespace] ?? generator.description,
  }));
};

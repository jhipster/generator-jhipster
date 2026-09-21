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
import type Environment from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';

export type GeneratorCommand = {
  namespace: string;
  /** Description from the generator USAGE file, or the one passed to `lookupGeneratorCommands`. */
  description?: string;
  command?: JHipsterCommandDefinition;
};

/** The part of the environment the lookups need: its generators store. */
export type GeneratorsEnvironment = Pick<Environment, 'getGeneratorMeta' | 'getGeneratorsMeta'>;

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

let jhipsterEnvironment: Promise<Environment> | undefined;

/**
 * An environment with only the jhipster generators, shared by the lookups that are not given one. The generators are
 * looked up by the environment rather than by a lookup of our own, so the namespaces are the ones the cli resolves.
 * Imported lazily: the environment builder sits above the generators, which sit above this module.
 */
export const getJHipsterEnvironment = (): Promise<Environment> => {
  jhipsterEnvironment ??= import('../../cli/environment-builder.ts')
    .then(({ default: EnvironmentBuilder }) => EnvironmentBuilder.createJHipsterBuilder())
    .then(builder => builder.getEnvironment());
  return jhipsterEnvironment;
};

/**
 * The `getGeneratorMeta` of an environment for `resolveGeneratorDependencies`, optionally with commands by namespace
 * that stand in for generators that are not registered, like the ones of a blueprint in a test.
 */
export const createGeneratorMetaLookup =
  (env: GeneratorsEnvironment, commands: Record<string, JHipsterCommandDefinition> = {}) =>
  (namespace: string): GeneratorMeta | undefined =>
    commands[namespace] ?
      ({ namespace, importModule: async () => ({ command: commands[namespace] }) } as unknown as GeneratorMeta)
    : env.getGeneratorMeta(namespace);

/**
 * Load the jhipster generators registered in the environment with their command definition.
 */
export const lookupGeneratorCommands = async ({
  env,
  descriptions = {},
}: { env?: GeneratorsEnvironment; descriptions?: Record<string, string> } = {}): Promise<GeneratorCommand[]> => {
  const generators: GeneratorCommand[] = [];
  // Sorted, so the result does not depend on the order the environment happened to register the generators in.
  const metas = Object.values((env ?? (await getJHipsterEnvironment())).getGeneratorsMeta()).sort((a, b) =>
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

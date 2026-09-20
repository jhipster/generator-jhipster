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
import { dirname, extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { GeneratorMeta } from '@yeoman/types';

import type { JHipsterCommandDefinition } from '../command/types.ts';
import { lookupGeneratorsWithNamespace } from '../utils/lookup.ts';

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

const commandsCache = new Map<string, Promise<JHipsterCommandDefinition | undefined>>();

/**
 * Import the command of a generator, from its own `command` module when it has one rather than from its index, which
 * also pulls the generator in. Besides being the smaller import, it keeps a command out of the import cycles the
 * generators form: a generator reached while it is already being evaluated hands back a half initialized module whose
 * `command` is undefined.
 */
const importGeneratorCommand = (generatorFile: string): Promise<JHipsterCommandDefinition | undefined> => {
  if (!commandsCache.has(generatorFile)) {
    const commandFile = join(dirname(generatorFile), `command${extname(generatorFile)}`);
    const ownCommand = existsSync(commandFile);
    commandsCache.set(
      generatorFile,
      import(pathToFileURL(ownCommand ? commandFile : generatorFile).toString()).then(module =>
        ownCommand ? module.default : module.command,
      ),
    );
  }
  return commandsCache.get(generatorFile)!;
};

/**
 * A `getGeneratorMeta` for `resolveGeneratorDependencies` backed by the generators of this installation, optionally
 * with blueprint commands by namespace. Commands are imported lazily, as the dependency graph reaches them.
 */
export const createGeneratorCommandsMetaLookup = (blueprints: Record<string, JHipsterCommandDefinition> = {}) => {
  const generatorFiles = new Map(
    lookupGeneratorsWithNamespace({ absolute: true }).map(({ namespace, generator }) => [`jhipster:${namespace}`, generator]),
  );
  return (namespace: string): GeneratorMeta | undefined => {
    const blueprintCommand = blueprints[namespace];
    const generatorFile = generatorFiles.get(namespace);
    if (!blueprintCommand && !generatorFile) return undefined;
    return {
      namespace,
      importModule: async () => ({ command: blueprintCommand ?? (await importGeneratorCommand(generatorFile!)) }),
    } as unknown as GeneratorMeta;
  };
};

let generatorsCache: Promise<GeneratorCommand[]> | undefined;

const readUsageDescription = (generatorFile: string): string | undefined => {
  const usage = readUsage(generatorFile);
  const description = usage ? /Description:\s*\n([^\n]+)/.exec(usage) : undefined;
  return description?.[1].trim();
};

/**
 * Load the generators of this installation with their command definition.
 */
export const lookupGeneratorCommands = async ({ descriptions = {} }: { descriptions?: Record<string, string> } = {}): Promise<
  GeneratorCommand[]
> => {
  generatorsCache ??= (async () => {
    const generators: GeneratorCommand[] = [];
    for (const { namespace, generator } of lookupGeneratorsWithNamespace({ absolute: true })) {
      generators.push({ namespace, description: readUsageDescription(generator), command: await importGeneratorCommand(generator) });
    }
    return generators;
  })();
  return (await generatorsCache).map(generator => ({
    ...generator,
    description: descriptions[generator.namespace] ?? generator.description,
  }));
};

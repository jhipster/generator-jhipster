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
import { pathToFileURL } from 'node:url';

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
      const module = await import(pathToFileURL(generator).toString());
      generators.push({ namespace, description: readUsageDescription(generator), command: module.command });
    }
    return generators;
  })();
  return (await generatorsCache).map(generator => ({
    ...generator,
    description: descriptions[generator.namespace] ?? generator.description,
  }));
};

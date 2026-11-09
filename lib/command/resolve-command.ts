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

import type { StoreGeneratorMeta } from 'yeoman-environment';

import { requireGeneratorCommand } from '../resolver/generator-command.ts';
import { JHIPSTER_NAMESPACE_PREFIX } from '../resolver/generator-commands.ts';
import {
  type GeneratorDependency,
  type ResolveGeneratorDependenciesOptions,
  resolveCommandDependencies,
} from '../resolver/generator-dependencies.ts';
import { packageNameToNamespace } from '../utils/namespace.ts';

import type { JHipsterCommandDefinition, JHipsterConfigs } from './types.ts';

export type ResolvedCommand = {
  /** The generator of the command, and its command. */
  meta: StoreGeneratorMeta;
  command?: JHipsterCommandDefinition;
  /** The generators contributing options to the command. */
  dependencies: GeneratorDependency[];
  /** The configs of the generators, the ones of the blueprints last. */
  configs: JHipsterConfigs;
};

/**
 * Resolve a command as the cli runs it: its generator, of the blueprint providing the command or of JHipster, and the
 * generators contributing options to it, with their configs. Undefined for a generator that is not registered.
 */
export const resolveCommand = (
  { command, blueprint, entrypointGenerator }: { command: string; blueprint?: string; entrypointGenerator?: string },
  options: ResolveGeneratorDependenciesOptions,
): ResolvedCommand | undefined => {
  const generator = blueprint ? `${packageNameToNamespace(blueprint)}:${command}` : command;
  const namespace = generator.includes(':') ? generator : `${JHIPSTER_NAMESPACE_PREFIX}${generator}`;
  const meta = options.getGeneratorMeta(namespace);
  if (!meta) return undefined;
  const dependencies = resolveCommandDependencies({ command, generator, entrypointGenerator }, options);
  const blueprintsLast = [
    ...dependencies.filter(({ blueprintNamespace }) => !blueprintNamespace),
    ...dependencies.filter(({ blueprintNamespace }) => blueprintNamespace),
  ];
  return {
    meta,
    command: requireGeneratorCommand(meta),
    dependencies,
    configs: Object.assign({}, ...blueprintsLast.map(({ command }) => command?.configs)),
  };
};

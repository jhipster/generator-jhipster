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
import { kebabCase } from 'lodash-es';

import { lookupGeneratorCommands } from '../resolver/generator-commands.ts';
import type { GeneratorDependency } from '../resolver/generator-dependencies.ts';

import { convertConfigToOption, extractArgumentsFromConfigs } from './converter.ts';
import { getCommandDerivedPropertyMutations } from './mutations.ts';
import type { JHipsterConfig } from './types.ts';

export type ConfigDescription = {
  name: string;
  /** Namespace of the command declaring the config. */
  owner: string;
  /** Blueprint providing the command, when any. */
  blueprint?: string;
  description?: string;
  scope?: string;
  cliOption?: string;
  cliHidden?: boolean;
  argument?: boolean;
  type?: string;
  choices?: (string | { value: string; name: string })[];
  default?: unknown;
  /** Prompt message, or `(dynamic)` when it cannot be computed without a generator. */
  prompt?: string;
  /** Names of the derived properties (`databaseTypeSql`, ...) added to the application context. */
  derivedProperties?: string[];
  jdl?: boolean;
};

export type CommandDescription = {
  namespace: string;
  description?: string;
  usage?: string;
  /** Generators contributing configs, in the order the cli registers their options. */
  dependencies: string[];
  arguments: { name: string; description?: string; type?: string; required?: boolean }[];
  configs: ConfigDescription[];
};

export type ConfigOwners = { name: string; owners: ConfigDescription[] };

const describeCliOption = (name: string, config: JHipsterConfig): string | undefined => {
  const option = convertConfigToOption(name, config);
  if (!option) return undefined;
  const optionName = kebabCase(option.name ?? name);
  return option.type === Boolean ? `--${optionName}` : `--${optionName} <value>`;
};

/**
 * Prompt factories receive the generator; a stub with empty configurations recovers the message of most of them.
 */
const promptGeneratorStub = () => {
  const stub: Record<string, unknown> = { jhipsterConfig: {}, jhipsterConfigWithDefaults: {}, options: {} };
  return new Proxy(stub, { get: (target, property) => (typeof property === 'string' ? target[property] : undefined) });
};

const describePrompt = (config: JHipsterConfig): string | undefined => {
  if (!config.prompt) return undefined;
  try {
    const prompt = typeof config.prompt === 'function' ? config.prompt(promptGeneratorStub() as any, config) : config.prompt;
    const message = typeof prompt.message === 'function' ? prompt.message({}) : prompt.message;
    return typeof message === 'string' ? message : '(dynamic)';
  } catch {
    return '(dynamic)';
  }
};

const describeDerivedProperties = (name: string, config: JHipsterConfig): string[] | undefined => {
  if (!config.choices) return undefined;
  const derived = Object.keys(getCommandDerivedPropertyMutations({ [name]: config })).filter(key => key !== '__override__' && key !== name);
  return derived.length > 0 ? derived : undefined;
};

export const describeConfig = (name: string, config: JHipsterConfig, owner: string, blueprint?: string): ConfigDescription => {
  const option = convertConfigToOption(name, config);
  return {
    name,
    owner,
    blueprint,
    description: config.description ?? config.cli?.description,
    scope: config.scope,
    cliOption: describeCliOption(name, config),
    cliHidden: config.cli?.hide ? true : undefined,
    argument: config.argument ? true : undefined,
    type: option?.type?.name ?? config.internal?.type?.name,
    choices: config.choices?.map(choice => (typeof choice === 'string' ? choice : { value: choice.value, name: choice.name })),
    default: typeof config.default === 'function' ? '(computed)' : config.default,
    prompt: describePrompt(config),
    derivedProperties: describeDerivedProperties(name, config),
    jdl: config.jdl ? true : undefined,
  };
};

/**
 * Describe a command from its resolved dependencies: the arguments of the command itself and the configs of every
 * dependency. Like the runtime configs merge, a config declared by several commands keeps the last declaration.
 */
export const describeCommand = ({
  namespace,
  description,
  usage,
  dependencies,
}: {
  namespace: string;
  description?: string;
  usage?: string;
  dependencies: GeneratorDependency[];
}): CommandDescription => {
  const rootCommand = dependencies.find(dependency => dependency.namespace === namespace)?.command;
  const configs = new Map<string, ConfigDescription>();
  for (const dependency of dependencies) {
    for (const [name, config] of Object.entries(dependency.command?.configs ?? {})) {
      // The owning command asks the prompt; keep the position of the last declaration.
      configs.delete(name);
      configs.set(name, describeConfig(name, config, dependency.namespace, dependency.blueprintNamespace));
    }
  }
  const commandArguments = rootCommand?.arguments ?? extractArgumentsFromConfigs(rootCommand?.configs);
  return {
    namespace,
    description,
    usage,
    dependencies: dependencies.map(dependency => dependency.namespace),
    arguments: Object.entries(commandArguments).map(([name, argument]) => ({
      name,
      description: argument.description,
      type: argument.type?.name,
      required: argument.required,
    })),
    configs: [...configs.values()],
  };
};

/**
 * Find the commands declaring a config, e.g. which generator owns `databaseType`.
 */
export const findConfigOwners = async (name: string): Promise<ConfigOwners> => {
  const owners = (await lookupGeneratorCommands())
    .filter(generator => generator.command?.configs?.[name])
    .map(generator => describeConfig(name, generator.command!.configs![name], generator.namespace));
  return { name, owners };
};

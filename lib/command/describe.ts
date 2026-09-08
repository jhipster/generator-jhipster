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

import type { GeneratorMeta } from '@yeoman/types';
import { kebabCase } from 'lodash-es';

import { lookupGeneratorsWithNamespace } from '../utils/lookup.ts';

import { convertConfigToOption, extractArgumentsFromConfigs } from './converter.ts';
import { getCommandDerivedPropertyMutations } from './mutations.ts';
import type { JHipsterCommandDefinition, JHipsterConfig } from './types.ts';

export type GeneratorDependency = {
  /** Namespace as requested, `app`, `jhipster:spring-boot:cache` or `jhipster-foo:app` for a blueprint override. */
  namespace: string;
  meta: GeneratorMeta;
  /** Set when the generator comes from a blueprint. */
  blueprintNamespace?: string;
  command?: JHipsterCommandDefinition;
};

export type ResolveGeneratorDependenciesOptions = {
  getGeneratorMeta: (namespace: string) => GeneratorMeta | undefined;
  blueprintNamespaces?: string[];
  /** Namespace prefix of the generators without one, defaults to `jhipster`. */
  namespacePrefix?: string;
  /** Called for a generator that is not registered. */
  onMissing?: (namespace: string) => void;
};

export type GeneratorDescription = {
  namespace: string;
  /** Description from the generator USAGE file, or the one passed to `describeGenerators`. */
  description?: string;
  command?: JHipsterCommandDefinition;
};

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
  /** Prompt message, `(dynamic)` when it cannot be computed without a generator. */
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

type JHipsterModule = { command?: JHipsterCommandDefinition };

/**
 * Resolve the generators contributing options to a command the way the cli does: the generators, their `import`s
 * recursively, and the blueprint generators overriding them (a blueprint command with `override` replaces the
 * original). The result is ordered as the cli registers the options.
 */
export const resolveGeneratorDependencies = async (
  generatorNames: string[],
  { getGeneratorMeta, blueprintNamespaces = [], namespacePrefix = 'jhipster', onMissing }: ResolveGeneratorDependenciesOptions,
): Promise<GeneratorDependency[]> => {
  const dependencies: GeneratorDependency[] = [];
  const isRegistered = (namespace: string) => dependencies.some(dependency => dependency.namespace === namespace);

  const register = async ({ namespace, blueprintNamespace }: { namespace: string; blueprintNamespace?: string }) => {
    const meta = getGeneratorMeta(namespace.includes(':') ? namespace : `${namespacePrefix}:${namespace}`);
    if (!meta) {
      if (!blueprintNamespace) onMissing?.(namespace);
      return undefined;
    }
    const module = (await meta.importModule?.()) as JHipsterModule | undefined;
    dependencies.push({ namespace, meta, blueprintNamespace, command: module?.command });
    return module;
  };

  const lookup = async ({ namespace, blueprintNamespace }: { namespace: string; blueprintNamespace?: string }) => {
    const lookupGeneratorAndImports = async (options: { namespace: string; blueprintNamespace?: string }) => {
      const module = await register(options);
      for (const imported of module?.command?.import ?? []) {
        await lookup({ namespace: imported, blueprintNamespace: options.blueprintNamespace });
      }
      return module?.command?.override;
    };

    let overridden = false;
    if (!namespace.includes(':')) {
      for (const nextBlueprint of blueprintNamespaces) {
        const blueprintSubGenerator = `${nextBlueprint}:${namespace}`;
        if (
          !isRegistered(blueprintSubGenerator) &&
          (await lookupGeneratorAndImports({ namespace: blueprintSubGenerator, blueprintNamespace: nextBlueprint }))
        ) {
          overridden = true;
        }
      }
    }
    if (!overridden && !isRegistered(namespace)) {
      await lookupGeneratorAndImports({ namespace, blueprintNamespace });
    }
  };

  for (const generatorName of generatorNames) {
    await lookup({ namespace: generatorName });
  }
  return dependencies;
};

/**
 * Read the USAGE file next to a generator file.
 */
export const readUsage = (generatorFile: string): string | undefined => {
  const usagePath = join(dirname(generatorFile), 'USAGE');
  return existsSync(usagePath) ? readFileSync(usagePath, 'utf8').trim() : undefined;
};

let generatorsCache: Promise<GeneratorDescription[]> | undefined;

const readUsageDescription = (generatorFile: string): string | undefined => {
  const usage = readUsage(generatorFile);
  const description = usage ? /Description:\s*\n([^\n]+)/.exec(usage) : undefined;
  return description?.[1].trim();
};

/**
 * Load the generators of this installation with their command definition.
 */
export const describeGenerators = async ({ descriptions = {} }: { descriptions?: Record<string, string> } = {}): Promise<
  GeneratorDescription[]
> => {
  generatorsCache ??= (async () => {
    const generators: GeneratorDescription[] = [];
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
      // The owning command asks the prompt, keep the position of the last declaration.
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
  const owners = (await describeGenerators())
    .filter(generator => generator.command?.configs?.[name])
    .map(generator => describeConfig(name, generator.command!.configs![name], generator.namespace));
  return { name, owners };
};

const formatChoices = (choices: ConfigDescription['choices']) =>
  choices?.map(choice => (typeof choice === 'string' ? choice : choice.value)).join(', ');

const formatDefault = (value: unknown): string => {
  if (value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
};

const table = (rows: string[][]): string => {
  const widths = rows[0].map((_cell, column) => Math.max(...rows.map(row => row[column].length)));
  return rows
    .map(row =>
      row
        .map((cell, column) => cell.padEnd(widths[column]))
        .join('  ')
        .trimEnd(),
    )
    .join('\n');
};

export const formatGenerators = (generators: { namespace: string; description?: string }[]): string =>
  table(generators.map(({ namespace, description }) => [namespace, description ?? '']));

const formatConfigRows = (configs: ConfigDescription[], { owner }: { owner: boolean }): string => {
  const header = ['config', 'cli', 'scope', 'type', 'choices', 'default', ...(owner ? ['owner'] : [])];
  const rows = configs.map(config => [
    config.name,
    config.argument ? '<argument>' : (config.cliOption ?? '') + (config.cliHidden ? ' (hidden)' : ''),
    config.scope ?? '',
    config.type ?? '',
    formatChoices(config.choices) ?? '',
    formatDefault(config.default),
    ...(owner ? [config.owner] : []),
  ]);
  return table([header, ...rows]);
};

export const formatCommandDescription = (command: CommandDescription, { prompts = false }: { prompts?: boolean } = {}): string => {
  const lines = [`${command.namespace}${command.description ? `: ${command.description}` : ''}`];
  const others = command.dependencies.filter(dependency => dependency !== command.namespace);
  if (others.length > 0) {
    lines.push(`with the options of: ${others.join(', ')}`);
  }
  if (command.arguments.length > 0) {
    lines.push(
      '',
      'arguments:',
      ...command.arguments.map(
        argument => `  ${argument.name}${argument.required ? ' (required)' : ''}${argument.description ? `: ${argument.description}` : ''}`,
      ),
    );
  }
  const configs = prompts ? command.configs.filter(config => config.prompt) : command.configs;
  if (configs.length === 0) {
    lines.push('', prompts ? 'no prompts' : 'no configs');
    return lines.join('\n');
  }
  const owner = configs.some(config => config.owner !== command.namespace);
  if (prompts) {
    lines.push(
      '',
      owner ?
        'prompts, in the order they are asked by each command (the composition order applies across commands):'
      : 'prompts, in the order they are asked:',
      ...configs.map(config => `  ${config.name}: ${config.prompt}${config.owner !== command.namespace ? ` (${config.owner})` : ''}`),
    );
    return lines.join('\n');
  }
  lines.push('', formatConfigRows(configs, { owner }));
  const derived = configs.filter(config => config.derivedProperties);
  if (derived.length > 0) {
    lines.push('', 'derived properties:', ...derived.map(config => `  ${config.name}: ${config.derivedProperties!.join(', ')}`));
  }
  const described = configs.filter(config => config.description);
  if (described.length > 0) {
    lines.push('', 'descriptions:', ...described.map(config => `  ${config.name}: ${config.description}`));
  }
  return lines.join('\n');
};

export const formatConfigOwners = ({ name, owners }: ConfigOwners): string => {
  if (owners.length === 0) {
    return `no command declares the config ${name}`;
  }
  return [`${name} is declared by: ${owners.map(owner => owner.owner).join(', ')}`, '', formatConfigRows(owners, { owner: true })].join(
    '\n',
  );
};

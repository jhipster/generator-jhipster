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

import { kebabCase } from 'lodash-es';

import { lookupGeneratorsWithNamespace } from '../utils/lookup.ts';

import { convertConfigToOption } from './converter.ts';
import { getCommandDerivedPropertyMutations } from './mutations.ts';
import type { JHipsterCommandDefinition, JHipsterConfig } from './types.ts';

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
  description?: string;
  scope?: string;
  cliOption?: string;
  cliHidden?: boolean;
  argument?: boolean;
  type?: string;
  choices?: (string | { value: string; name: string })[];
  default?: unknown;
  /** Prompt message, `(dynamic)` when the prompt is built at runtime. */
  prompt?: string;
  /** Names of the derived properties (`databaseTypeSql`, ...) added to the application context. */
  derivedProperties?: string[];
  jdl?: boolean;
};

export type CommandDescription = {
  namespace: string;
  description?: string;
  usage?: string;
  imports: string[];
  arguments: { name: string; description?: string; type?: string; required?: boolean }[];
  configs: ConfigDescription[];
};

export type ConfigOwners = { name: string; owners: ConfigDescription[] };

let generatorsCache: Promise<GeneratorDescription[]> | undefined;

const readUsageDescription = (generatorFile: string): string | undefined => {
  const usagePath = join(dirname(generatorFile), 'USAGE');
  if (!existsSync(usagePath)) return undefined;
  const description = /Description:\s*\n([^\n]+)/.exec(readFileSync(usagePath, 'utf8'));
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

const normalizeNamespace = (namespace: string) => namespace.replace(/^jhipster:/, '');

export const findGenerator = async (namespace: string): Promise<GeneratorDescription> => {
  const name = normalizeNamespace(namespace);
  const generator = (await describeGenerators()).find(entry => entry.namespace === name);
  if (!generator) {
    throw new Error(`Generator ${name} not found`);
  }
  return generator;
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
const promptGeneratorStub = () =>
  new Proxy(
    { jhipsterConfig: {}, jhipsterConfigWithDefaults: {}, options: {} },
    {
      get: (target, property) => (property in target ? target[property as string] : undefined),
    },
  );

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

export const describeConfig = (name: string, config: JHipsterConfig, owner: string): ConfigDescription => {
  const option = convertConfigToOption(name, config);
  return {
    name,
    owner,
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
 * Describe a command: arguments, configs and, with `includeImports`, the configs of the imported commands.
 * A config declared by several commands is reported once, the first declaration wins like the runtime merge.
 */
export const describeCommand = async (
  namespace: string,
  { includeImports = false }: { includeImports?: boolean } = {},
): Promise<CommandDescription> => {
  const generator = await findGenerator(namespace);
  const configs: ConfigDescription[] = [];
  const visited = new Set<string>();
  const collect = async (entry: GeneratorDescription) => {
    if (visited.has(entry.namespace)) return;
    visited.add(entry.namespace);
    for (const [name, config] of Object.entries(entry.command?.configs ?? {})) {
      if (!configs.some(existing => existing.name === name)) {
        configs.push(describeConfig(name, config, entry.namespace));
      }
    }
    if (includeImports) {
      for (const imported of entry.command?.import ?? []) {
        await collect(await findGenerator(imported));
      }
    }
  };
  await collect(generator);
  return {
    namespace: generator.namespace,
    description: generator.description,
    imports: [...(generator.command?.import ?? [])],
    arguments: Object.entries(generator.command?.arguments ?? {}).map(([name, argument]) => ({
      name,
      description: argument.description,
      type: argument.type?.name,
      required: argument.required,
    })),
    configs,
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

export const formatGenerators = (generators: GeneratorDescription[]): string =>
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
  if (command.imports.length > 0) {
    lines.push(`imports: ${command.imports.join(', ')}`);
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
  if (prompts) {
    lines.push(
      '',
      'prompts, in the order they are asked:',
      ...configs.map(config => `  ${config.name}: ${config.prompt}${config.owner !== command.namespace ? ` (${config.owner})` : ''}`),
    );
    return lines.join('\n');
  }
  const owner = configs.some(config => config.owner !== command.namespace);
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

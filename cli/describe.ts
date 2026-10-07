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
import type Environment from 'yeoman-environment';

import {
  type CommandDescription,
  type CommandSummary,
  type ConfigDescription,
  type ConfigOwners,
  describeGenerator,
  findConfigOwners,
  listCommands,
} from '../lib/command/describe-command.ts';

import type EnvironmentBuilder from './environment-builder.ts';
import { logger } from './utils.ts';

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

const formatGenerators = (generators: CommandSummary[]): string =>
  table(
    generators.map(generator => [generator.namespace, `${generator.description ?? ''}${generator.default ? ' (default command)' : ''}`]),
  );

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

const formatCommandDescription = (command: CommandDescription, { prompts = false }: { prompts?: boolean } = {}): string => {
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

const formatConfigOwners = ({ name, owners }: ConfigOwners): string => {
  if (owners.length === 0) {
    return `no command declares the config ${name}`;
  }
  return [`${name} is declared by: ${owners.map(owner => owner.owner).join(', ')}`, '', formatConfigRows(owners, { owner: true })].join(
    '\n',
  );
};

type DescribeOptions = { config?: string; imports?: boolean; prompts?: boolean; json?: boolean };

const print = (value: string | object) => {
  // eslint-disable-next-line no-console
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
};

/**
 * `jhipster describe`: list the commands, describe a command with the options the cli builds for it, or find the
 * commands declaring a config.
 */
const describeCliCommand = async (
  [generator]: [string | undefined],
  options: DescribeOptions,
  _env: Environment,
  envBuilder?: EnvironmentBuilder,
) => {
  if (options.config) {
    // The store of the cli: blueprints declare configs too.
    const owners = findConfigOwners(options.config, { store: envBuilder?.getStore() });
    print(options.json ? owners : formatConfigOwners(owners));
    return;
  }

  const blueprints = await envBuilder?.getDescribeBlueprints();
  if (!generator) {
    const generators = listCommands({ blueprints });
    print(options.json ? generators : formatGenerators(generators));
    return;
  }

  const description = describeGenerator(generator, {
    store: envBuilder?.getStore(),
    blueprints,
    imports: options.imports,
    onMissing: (namespace: string) => logger.warn(`Generator ${namespace} not found.`),
  });
  if (!description) {
    logger.fatal(`Generator ${generator} not found, run \`jhipster describe\` to list the commands.`);
    return;
  }
  print(options.json ? description : formatCommandDescription(description, { prompts: options.prompts }));
};

export default describeCliCommand;

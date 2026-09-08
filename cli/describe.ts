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
  describeCommand,
  findConfigOwners,
  formatCommandDescription,
  formatConfigOwners,
  formatGenerators,
  readUsage,
  resolveGeneratorDependencies,
} from '../lib/command/describe.ts';
import { packageNameToNamespace } from '../lib/utils/index.ts';

import defaultCommands from './commands.ts';
import type EnvironmentBuilder from './environment-builder.ts';
import type { CliCommand } from './types.ts';
import { CLI_NAME, logger } from './utils.ts';

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
  env: Environment,
  envBuilder?: EnvironmentBuilder,
) => {
  if (options.config) {
    const owners = await findConfigOwners(options.config);
    print(options.json ? owners : formatConfigOwners(owners));
    return;
  }

  const commands: Record<string, CliCommand> = { ...defaultCommands, ...(await envBuilder?.getBlueprintCommands()) };
  if (!generator) {
    const generators = Object.entries(commands)
      .filter(([_name, command]) => !command.removed)
      .map(([namespace, command]) => ({ namespace, description: command.desc }));
    print(options.json ? generators : formatGenerators(generators));
    return;
  }

  const command = commands[generator];
  const namespace = command?.blueprint ? `${packageNameToNamespace(command.blueprint)}:${generator}` : generator;
  const meta = env.getGeneratorMeta(namespace.includes(':') ? namespace : `${CLI_NAME}:${namespace}`);
  if (!meta) {
    logger.fatal(`Generator ${generator} not found, run \`jhipster describe\` to list the commands.`);
    return;
  }
  const resolveOptions = {
    getGeneratorMeta: (ns: string) => env.getGeneratorMeta(ns),
    blueprintNamespaces: envBuilder?.getBlueprintsNamespaces(),
    onMissing: (ns: string) => logger.warn(`Generator ${ns} not found.`),
  };
  // Like the cli, a command carries the options of the bootstrap generator, its own and the imported ones.
  const dependencies =
    options.imports === false ?
      await resolveGeneratorDependencies([namespace], { ...resolveOptions, blueprintNamespaces: [] }).then(all =>
        all.filter(dependency => dependency.namespace === namespace),
      )
    : await resolveGeneratorDependencies(['bootstrap', namespace], resolveOptions);
  const description = describeCommand({
    namespace,
    description: command?.desc,
    usage: meta.resolved ? readUsage(meta.resolved) : undefined,
    dependencies,
  });
  print(options.json ? description : formatCommandDescription(description, { prompts: options.prompts }));
};

export default describeCliCommand;

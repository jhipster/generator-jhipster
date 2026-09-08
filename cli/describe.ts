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
import {
  describeCommand,
  describeGenerators,
  findConfigOwners,
  formatCommandDescription,
  formatConfigOwners,
  formatGenerators,
} from '../lib/command/describe.ts';

import commands from './commands.ts';
import type { CliCommand } from './types.ts';

type DescribeOptions = { config?: string; imports?: boolean; prompts?: boolean; json?: boolean };

const print = (value: string | object) => {
  // eslint-disable-next-line no-console
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
};

/**
 * `jhipster describe`: list the generators, describe a command or find the owners of a config.
 */
const describeCliCommand = async ([generator]: [string | undefined], options: DescribeOptions) => {
  if (options.config) {
    const owners = await findConfigOwners(options.config);
    print(options.json ? owners : formatConfigOwners(owners));
    return;
  }
  if (!generator) {
    const descriptions = Object.fromEntries(Object.entries(commands).map(([name, command]) => [name, command.desc]));
    const generators = (await describeGenerators({ descriptions })).filter(
      ({ namespace }) => !(commands as Record<string, CliCommand>)[namespace]?.removed,
    );
    print(options.json ? generators.map(({ namespace, description }) => ({ namespace, description })) : formatGenerators(generators));
    return;
  }
  // Prompts of an entrypoint like `app` are asked by the composed generators.
  const command = await describeCommand(generator, { includeImports: options.imports || options.prompts });
  print(options.json ? command : formatCommandDescription(command, { prompts: options.prompts }));
};

export default describeCliCommand;

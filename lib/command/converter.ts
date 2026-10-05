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

import type {
  CliSpec,
  CommandConfigDefault,
  CommandConfigScope,
  ConfigSpec,
  JHipsterArgumentsWithChoices,
  JHipsterConfigs,
} from './types.ts';

export const extractArgumentsFromConfigs = (configs: JHipsterConfigs | undefined): JHipsterArgumentsWithChoices => {
  if (!configs) return {};
  return Object.fromEntries(
    Object.entries(configs)
      .filter(([_name, def]) => def.argument)
      .map(([name, def]) => [
        name,
        {
          description: def.description,
          scope: def.scope,
          choices: def.choices,
          ...def.argument,
        },
      ]),
  ) as JHipsterArgumentsWithChoices;
};

export type JHipsterCommandOptions = CliSpec & {
  choices?: string[];
  scope: CommandConfigScope;
  default?: CommandConfigDefault<any>;
};

/**
 * The flags of an option, as the cli registers it and prints it in its help: `-a, --name <value>`, `<value...>` for a
 * list, `[value]` when the value is optional, and no value for a boolean.
 */
export const formatOptionFlags = (
  optionName: string,
  { alias, type, required }: Pick<JHipsterCommandOptions, 'alias' | 'type' | 'required'>,
): string => {
  const flags = `${alias ? `-${alias}, ` : ''}--${optionName}`;
  if (type === Array) {
    return required === false ? `${flags} [value...]` : `${flags} <value...>`;
  }
  if (type && type !== Boolean) {
    return required === false ? `${flags} [value]` : `${flags} <value>`;
  }
  return flags;
};

export const convertConfigToOption = <const T extends ConfigSpec<any>>(name: string, config: T): JHipsterCommandOptions | undefined => {
  const { cli } = config;
  const type = cli?.type ?? config.internal?.type;
  if (!type && config?.internal) return undefined;

  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
  return {
    ...cli,
    name: cli?.name ?? name,
    default: config.default ?? cli?.default,
    description: config.description ?? cli?.description,
    env: config.cli?.env,
    choices,
    scope: config.scope,
    type: type!,
  };
};

/**
 * The name of the option of a config in the command line. A digit followed by a lower case letter stays in its word
 * (`e2eTls` is `e2e-tls`): kebabCase gives `e-2-e-tls`, which the cli reads as another option (`e2ETls`).
 */
const toOptionName = (name: string) => (/\d[a-z]/.test(name) ? name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() : kebabCase(name));

/**
 * The option the cli registers for a config, with its name in the command line: none for a config without `cli`, like
 * the internal ones and the ones only the jdl sets.
 */
export const convertConfigToCliOption = <const T extends ConfigSpec<any>>(
  name: string,
  config: T,
): { optionName: string; option: JHipsterCommandOptions } | undefined => {
  const option = config.cli ? convertConfigToOption(name, config) : undefined;
  return option && { optionName: toOptionName(option.name ?? name), option };
};

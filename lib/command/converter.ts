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

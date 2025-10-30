/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { snakeCase, upperCase } from 'lodash-es';

import clientCommand from '../../generators/client/command.ts';
import liquibaseCommand from '../../generators/liquibase/command.ts';
import springBootCommand from '../../generators/spring-boot/command.ts';
import gatewayCommand from '../../generators/spring-cloud/generators/gateway/command.ts';
import springCloudStreamCommand from '../../generators/spring-cloud-stream/command.ts';
import type { JHipsterConfigs } from '../command/types.ts';
import { createRuntime } from '../jdl/core/runtime.ts';
import type { JDLApplicationConfig, JHipsterOptionDefinition } from '../jdl/core/types/parsing.ts';
import type { JDLRuntime } from '../jdl/core/types/runtime.ts';

export const extractJdlDefinitionFromCommandConfig = (configs: JHipsterConfigs = {}): JHipsterOptionDefinition[] =>
  Object.entries(configs)
    .filter(([_name, def]) => def.jdl)
    .map(([name, def]) => ({
      ...(def.jdl as Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>),
      name,
      knownChoices: def.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value)),
    }))
    .sort((a, b) => (b.name.startsWith(a.name) ? 1 : a.name.localeCompare(b.name)));

export const buildJDLApplicationConfig = (configs: JHipsterConfigs): JDLApplicationConfig => {
  const jdlOptions = extractJdlDefinitionFromCommandConfig(configs);
  return {
    quotedOptionNames: [],
    tokenConfigs: jdlOptions.map(option => ({
      name: upperCase(snakeCase(option.name)),
      pattern: option.name,
    })),
    validatorConfig: Object.fromEntries(
      jdlOptions.map(option => [
        upperCase(snakeCase(option.name)),
        {
          type: option.tokenType,
          pattern: option.tokenValuePattern,
          msg: `${option.name} property`,
        },
      ]),
    ),
    optionsValues: Object.fromEntries(
      jdlOptions
        .filter(option => option.knownChoices)
        .map(option => [option.name, Object.fromEntries(option.knownChoices!.map(choice => [choice, choice]))]),
    ),
    optionsTypes: Object.fromEntries(
      jdlOptions.map(option => [
        option.name,
        {
          type: option.type,
        },
      ]),
    ),
  };
};

let defaultJDLApplicationConfig: JDLApplicationConfig;
export const getDefaultJDLApplicationConfig = () => {
  defaultJDLApplicationConfig ??= buildJDLApplicationConfig({
    ...springCloudStreamCommand.configs,
    ...springBootCommand.configs,
    ...clientCommand.configs,
    ...liquibaseCommand.configs,
    ...gatewayCommand.configs,
  });
  return defaultJDLApplicationConfig;
};

let defaultRuntime: JDLRuntime;
export const getDefaultRuntime = (): JDLRuntime => {
  if (!defaultRuntime) {
    defaultRuntime = createRuntime(getDefaultJDLApplicationConfig());
  }

  return defaultRuntime;
};

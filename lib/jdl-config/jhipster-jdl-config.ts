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
import { snakeCase, upperCase } from 'lodash-es';

import type { JHipsterConfigs } from '../command/types.ts';
import type { JDLApplicationConfig, JHipsterOptionDefinition } from '../jdl/core/types/parsing.ts';
import { resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';
import { getJHipsterStore } from '../resolver/lookups.ts';

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
    quotedOptionNames: jdlOptions.filter(option => option.quoted).map(option => option.name),
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
      jdlOptions.map(option => [option.name, { type: option.type, ...(option.deprecated ? { deprecated: option.deprecated } : {}) }]),
    ),
  };
};

/** The configs of a generator and of everything it imports, the dependency graph the cli resolves. */
const lookupConfigsFrom = (generator: string): JHipsterConfigs => {
  const store = getJHipsterStore();
  const configs: JHipsterConfigs = {};
  for (const { command } of resolveGeneratorDependencies([generator], { getGeneratorMeta: namespace => store.getMeta(namespace) })) {
    Object.assign(configs, command?.configs);
  }
  return configs;
};

let defaultJDLApplicationConfig: Readonly<JDLApplicationConfig>;
/**
 * The application JDL definitions: the jdl options of the `app` generator and of everything it imports, so an option
 * moving into any command `app` reaches is picked up without a list to maintain.
 */
export const getDefaultJDLApplicationConfig = (): Readonly<JDLApplicationConfig> => {
  defaultJDLApplicationConfig ??= Object.freeze(buildJDLApplicationConfig(lookupConfigsFrom('app')));
  return defaultJDLApplicationConfig;
};

let defaultJDLDeploymentConfig: Readonly<JDLApplicationConfig>;
/**
 * The deployment JDL definitions, the same way: the jdl options of the `deployment` generator and of the deployment
 * types it imports, `docker-compose` and `kubernetes`.
 */
export const getDefaultJDLDeploymentConfig = (): Readonly<JDLApplicationConfig> => {
  defaultJDLDeploymentConfig ??= Object.freeze(buildJDLApplicationConfig(lookupConfigsFrom('deployment')));
  return defaultJDLDeploymentConfig;
};

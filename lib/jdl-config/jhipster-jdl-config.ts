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
import { type ResolveGeneratorDependenciesOptions, resolveGeneratorDependencies } from '../resolver/generator-dependencies.ts';
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
    validatorConfig: Object.fromEntries(
      jdlOptions.map(option => [
        option.name,
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
export const lookupJDLConfigsFrom = (generator: string, options?: ResolveGeneratorDependenciesOptions): JHipsterConfigs => {
  const lookupOptions = options ?? { getGeneratorMeta: (namespace: string) => getJHipsterStore().getMeta(namespace) };
  const configs: JHipsterConfigs = {};
  for (const { command } of resolveGeneratorDependencies([generator], lookupOptions)) {
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
  defaultJDLApplicationConfig ??= Object.freeze(buildJDLApplicationConfig(lookupJDLConfigsFrom('app')));
  return defaultJDLApplicationConfig;
};

const deploymentDefaults = new Map<string, Readonly<Record<string, any>>>();
/**
 * The defaults of the options of a deployment of the type: the ones `base-workspaces` declares, shared by every type,
 * and the ones the command of the type declares - `docker-compose` or `kubernetes`, which the deploymentType names.
 */
export const getDefaultJDLDeploymentDefaults = (deploymentType = ''): Readonly<Record<string, any>> => {
  if (!deploymentDefaults.has(deploymentType)) {
    const store = getJHipsterStore();
    const defaults: Record<string, any> = {};
    // base-workspaces declares the options shared by every type, the generator of the type imports it; the type may
    // name no generator (`none` for workspaces).
    const dependencies = resolveGeneratorDependencies(['base-workspaces', ...(deploymentType ? [deploymentType] : [])], {
      getGeneratorMeta: namespace => store.getMeta(namespace),
    });
    for (const { command } of dependencies) {
      for (const [name, config] of Object.entries(command?.configs ?? {})) {
        if (config.default !== undefined && typeof config.default !== 'function') {
          defaults[name] = config.default;
        }
      }
    }
    deploymentDefaults.set(deploymentType, Object.freeze(defaults));
  }
  return deploymentDefaults.get(deploymentType)!;
};

let defaultJDLDeploymentConfig: Readonly<JDLApplicationConfig>;
/**
 * The deployment JDL definitions, the same way: the jdl options of the `deployment` generator and of the deployment
 * types it imports, `docker-compose` and `kubernetes`.
 */
export const getDefaultJDLDeploymentConfig = (): Readonly<JDLApplicationConfig> => {
  defaultJDLDeploymentConfig ??= Object.freeze(buildJDLApplicationConfig(lookupJDLConfigsFrom('deployment')));
  return defaultJDLDeploymentConfig;
};

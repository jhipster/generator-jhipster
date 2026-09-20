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

import appCommand from '../../generators/app/command.ts';
import baseCommand from '../../generators/base/command.ts';
import bootstrapCommand from '../../generators/bootstrap/command.ts';
import clientCommand from '../../generators/client/command.ts';
import commonCommand from '../../generators/common/command.ts';
import javaSimpleApplicationCommand from '../../generators/java-simple-application/command.ts';
import buildToolCommand from '../../generators/java-simple-application/generators/build-tool/command.ts';
import gradleCommand from '../../generators/java-simple-application/generators/gradle/command.ts';
import languagesCommand from '../../generators/languages/command.ts';
import liquibaseCommand from '../../generators/liquibase/command.ts';
import serverCommand from '../../generators/server/command.ts';
import springBootCommand from '../../generators/spring-boot/command.ts';
import gatewayCommand from '../../generators/spring-cloud/generators/gateway/command.ts';
import { lookupCommandsConfigs } from '../command/lookup-commands-configs.ts';
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
      jdlOptions.map(option => [
        option.name,
        {
          type: option.type,
        },
      ]),
    ),
  };
};

/**
 * The commands that declared jdl options when the definitions were assembled from a hand maintained list, kept so that
 * {@link getDefaultJDLApplicationConfigSync} has something to build from. `jhipster-jdl-config.spec.ts` fails when it
 * drifts from what the import graph resolves.
 *
 * @deprecated use {@link getDefaultJDLApplicationConfig}, which resolves the graph instead.
 */
const legacyJDLApplicationCommands = [
  appCommand,
  springBootCommand,
  bootstrapCommand,
  baseCommand,
  clientCommand,
  javaSimpleApplicationCommand,
  buildToolCommand,
  gradleCommand,
  languagesCommand,
  liquibaseCommand,
  serverCommand,
  commonCommand,
  gatewayCommand,
];

let defaultJDLApplicationConfigSync: Readonly<JDLApplicationConfig>;
/**
 * The application JDL definitions assembled from a hand maintained list of commands, which has to be edited whenever an
 * option moves into a command and silently drops the option when it is not.
 *
 * It exists only so that the synchronous public api - {@link createImporterFromFiles} and
 * {@link createImporterFromContent} called without a definition - keeps working. Pass a definition instead: the cli
 * resolves one from the generator graph and hands it over.
 *
 * @deprecated to be removed in v10, use {@link getDefaultJDLApplicationConfig}.
 */
export const getDefaultJDLApplicationConfigSync = (): Readonly<JDLApplicationConfig> => {
  defaultJDLApplicationConfigSync ??= Object.freeze(
    buildJDLApplicationConfig(Object.assign({}, ...legacyJDLApplicationCommands.map(command => command.configs))),
  );
  return defaultJDLApplicationConfigSync;
};

let defaultJDLApplicationConfig: Readonly<JDLApplicationConfig>;
/**
 * The application JDL definitions, assembled from the `app` generator's command and everything it imports - the same
 * dependency graph the cli resolves for itself and `jhipster describe` walks - replacing a hand maintained list of
 * commands. Async because it walks that graph; the jdl importer only falls back to the synchronous list, so nothing
 * public depends on this one.
 */
export const getDefaultJDLApplicationConfig = async (): Promise<Readonly<JDLApplicationConfig>> => {
  defaultJDLApplicationConfig ??= Object.freeze(buildJDLApplicationConfig(await lookupCommandsConfigs({ from: ['app'] })));
  return defaultJDLApplicationConfig;
};

let defaultRuntime: JDLRuntime;
export const getDefaultRuntime = async (): Promise<JDLRuntime> => {
  if (!defaultRuntime) {
    defaultRuntime = createRuntime(await getDefaultJDLApplicationConfig());
  }

  return defaultRuntime;
};

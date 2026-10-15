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
import type { JHipsterEntityConfigs } from '../command/types.ts';
import type { JDLOptionsDefinition } from '../jdl/core/parsing/types/parsing.ts';

import { lookupCommandsPropertyFrom } from './jhipster-jdl-config.ts';

/**
 * The option statements of the entity options of commands, named by their keyword as the jdl writes them: an option
 * without jdl spec has no statement.
 */
export const buildJDLEntityConfig = (entityConfigs: JHipsterEntityConfigs): JDLOptionsDefinition => ({
  configs: Object.fromEntries(
    Object.entries(entityConfigs).flatMap(([name, { jdl, ...config }]) => {
      if (!jdl) return [];
      const { keyword = name, value: _value, ...statement } = jdl;
      return [[keyword, { ...config, jdl: statement }]];
    }),
  ),
});

let defaultJDLEntityConfig: Readonly<JDLOptionsDefinition>;
/**
 * The entity JDL definitions: the entity options of the `app` generator and of everything it imports, so an option
 * moving into any command `app` reaches is picked up without a list to maintain.
 */
export const getDefaultJDLEntityConfig = (): Readonly<JDLOptionsDefinition> => {
  defaultJDLEntityConfig ??= Object.freeze(buildJDLEntityConfig(lookupCommandsPropertyFrom('app', 'entity')));
  return defaultJDLEntityConfig;
};

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
import type { JHipsterFieldConfigs } from '../command/types.ts';
import type { JDLValidationsDefinition } from '../jdl/core/parsing/types/parsing.ts';

import { lookupCommandsPropertyFrom } from './jhipster-jdl-config.ts';

/**
 * The field validations written with a value, the ones of the fields of commands: the ones without a value, like
 * `required`, are keywords of the language.
 */
export const buildJDLValidationConfig = ({ validations = {} }: JHipsterFieldConfigs): JDLValidationsDefinition => ({
  configs: Object.fromEntries(
    Object.entries(validations).flatMap(([name, { description, jdl }]) =>
      jdl ? [[name, { description, jdl: { value: jdl.value } }]] : [],
    ),
  ),
});

let defaultJDLValidationConfig: Readonly<JDLValidationsDefinition>;
/** The field validations of the `app` generator and of everything it imports. */
export const getDefaultJDLValidationConfig = (): Readonly<JDLValidationsDefinition> => {
  defaultJDLValidationConfig ??= Object.freeze(buildJDLValidationConfig(lookupCommandsPropertyFrom('app', 'field')));
  return defaultJDLValidationConfig;
};

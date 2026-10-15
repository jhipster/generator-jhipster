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
import type { JDLFieldTypesDefinition } from '../jdl/core/parsing/types/parsing.ts';

import { lookupCommandsPropertyFrom } from './jhipster-jdl-config.ts';

/** The type of a field whose type is an enum of the jdl. */
const ENUM_TYPE = 'Enum';

/** The field types of commands, with the validations they take, and the validations of the fields of an enum type. */
export const buildJDLFieldTypesConfig = ({ types = {} }: JHipsterFieldConfigs): JDLFieldTypesDefinition => ({
  types: Object.fromEntries(
    Object.entries(types)
      .filter(([type]) => type !== ENUM_TYPE)
      .map(([type, { validations = [], deprecated }]) => [type, { validations: [...validations], ...(deprecated ? { deprecated } : {}) }]),
  ),
  enum: { validations: [...(types[ENUM_TYPE]?.validations ?? [])] },
});

let defaultJDLFieldTypesConfig: Readonly<JDLFieldTypesDefinition>;
/** The field types of the `app` generator and of everything it imports. */
export const getDefaultJDLFieldTypesConfig = (): Readonly<JDLFieldTypesDefinition> => {
  defaultJDLFieldTypesConfig ??= Object.freeze(buildJDLFieldTypesConfig(lookupCommandsPropertyFrom('app', 'field')));
  return defaultJDLFieldTypesConfig;
};

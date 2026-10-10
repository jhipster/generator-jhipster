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
import type { JDLOptionsDefinition } from '../jdl/core/parsing/types/parsing.ts';

import { buildJDLEntityConfig } from './jdl-entity-config.ts';
import { lookupCommandsPropertyFrom } from './jhipster-jdl-config.ts';

/** The option statements of the relationship options of commands, shaped like the ones of the entities. */
export const buildJDLRelationshipConfig = buildJDLEntityConfig;

let defaultJDLRelationshipConfig: Readonly<JDLOptionsDefinition>;
/**
 * The relationship JDL definitions: the relationship options of the `app` generator and of everything it imports, the
 * ones the generators add to the options of the language.
 */
export const getDefaultJDLRelationshipConfig = (): Readonly<JDLOptionsDefinition> => {
  defaultJDLRelationshipConfig ??= Object.freeze(buildJDLRelationshipConfig(lookupCommandsPropertyFrom('app', 'relationship')));
  return defaultJDLRelationshipConfig;
};

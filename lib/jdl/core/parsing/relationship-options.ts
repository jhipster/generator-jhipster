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
import type { JDLOptionConfig } from './types/parsing.ts';

/** The relationship option relating to a built-in entity, which the jdl does not declare: `A to User with builtInEntity`. */
export const JDL_RELATIONSHIP_BUILT_IN_ENTITY = 'builtInEntity';

/** The relationship options of the language, known whatever the definitions. */
export const builtInRelationshipOptions: Readonly<Record<string, JDLOptionConfig>> = Object.freeze({
  [JDL_RELATIONSHIP_BUILT_IN_ENTITY]: {
    description: 'The destination is a built-in entity, which the jdl does not declare',
    jdl: { type: 'unary' },
  },
});

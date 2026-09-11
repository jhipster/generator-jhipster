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

import { type EnumValues, parseEnumValues, serializeEnumValues } from '../../../lib/utils/enum.ts';

/** Accept legacy entries or a JSON array at the prompt; uppercase names, never custom values. */
export function parseEnumValuesInput(input: EnumValues): EnumValues {
  const values = typeof input === 'string' && input.trimStart().startsWith('[') ? JSON.parse(input) : input;
  return serializeEnumValues(
    parseEnumValues(values, { clientConstants: true }).map(entry => ({ ...entry, name: entry.name.toUpperCase() })),
  );
}

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
import { mutateData } from '../../../../../lib/utils/index.ts';
import type { DatabaseField } from '../types.d.ts';

/**
 * Whether the column of a field may be null, and whether it is required. Every generator writing a backend reads them,
 * so they are prepared once here rather than by the generator of the changelog alone.
 */
export function prepareFieldForDatabase({ field }: { field: DatabaseField }) {
  mutateData(field, {
    __override__: false,
    // Set before nullable, which reads it.
    columnRequired: data => data.nullable === false || (data.fieldValidate && data.fieldValidateRules?.includes('required')),
    nullable: data => !data.columnRequired,
  });
}

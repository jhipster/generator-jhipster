/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { snakeCase, startCase, upperFirst } from 'lodash-es';

import { mutateData } from '../../../lib/utils/index.ts';
import { getTypescriptType } from '../support/index.ts';
import type { Field as JavascriptField } from '../types.ts';

export function prepareFieldForTemplates(field: JavascriptField): JavascriptField {
  mutateData(field, {
    __override__: false,
    path: [field.fieldName],
    propertyName: field.fieldName,

    fieldNameCapitalized: ({ fieldName }) => upperFirst(fieldName),
    fieldNameUnderscored: ({ fieldName }) => snakeCase(fieldName),
    fieldNameHumanized: ({ fieldName }) => startCase(fieldName),
    tsType: ({ fieldType }) => getTypescriptType(fieldType),
  });
  return field;
}

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
import { CommonDBTypes } from '../../../lib/jhipster/field-types.ts';
import { buildMutateDataForProperty } from '../../../lib/utils/derived-property.ts';
import type { JsonType } from '../../base-application/types.ts';

const { BIG_DECIMAL, BOOLEAN, DOUBLE, FLOAT, INTEGER, LONG, UUID } = CommonDBTypes;

export const getJsonType = (fieldType: string): JsonType => {
  if (fieldType === LONG || fieldType === BIG_DECIMAL) return 'number-or-text';
  if (fieldType === INTEGER || fieldType === FLOAT || fieldType === DOUBLE) return 'number';
  if (fieldType === BOOLEAN) return 'boolean';
  if (fieldType === UUID) return 'uuid';
  return 'text';
};

export const jsonTypes = ['number', 'number-or-text', 'boolean', 'uuid', 'text'] as const satisfies readonly JsonType[];

/** A flag for each JSON type, `jsonTypeNumberOrText`: every field has one, so there is no `jsonTypeAny`. */
export const jsonTypeDerivedProperties = buildMutateDataForProperty('jsonType', jsonTypes);

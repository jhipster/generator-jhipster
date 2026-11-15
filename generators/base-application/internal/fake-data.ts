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
import { fieldTypes } from '../../../lib/jhipster/index.ts';
import type { Field as BaseApplicationField } from '../types.ts';

const { BOOLEAN, INTEGER, LONG } = fieldTypes.CommonDBTypes;

/** The largest range of integers listed as a domain. */
const MAX_DOMAIN_RANGE = 1000;

export type FieldDomainValue = string | number | boolean;

/**
 * The values a field can take when they can be listed: an enum, a boolean or integers with a small range.
 * A field with a template or a pattern has its values given by them.
 */
export function getFieldFakeDataDomain(field: BaseApplicationField): FieldDomainValue[] | undefined {
  if (field.fakerTemplate || (field.fieldValidate && field.fieldValidateRules?.includes('pattern'))) {
    return undefined;
  }
  if (field.fieldIsEnum) {
    return field.enumValues?.map(({ name }) => name);
  }
  if (field.fieldType === BOOLEAN) {
    return [false, true];
  }
  if (([INTEGER, LONG] as string[]).includes(field.fieldType)) {
    const min = Number.parseInt(`${field.fieldValidateRulesMin ?? 0}`, 10);
    const max = Number.parseInt(`${field.fieldValidateRulesMax ?? 32767}`, 10);
    if (max - min <= MAX_DOMAIN_RANGE) {
      return Array.from({ length: max - min + 1 }, (_, index) => min + index);
    }
  }
  return undefined;
}

type GenerateValue<F extends BaseApplicationField> = (field: F) => any;

/** A sample written as TypeScript code: the values are expressions. */
export const generateTsSample = <F extends BaseApplicationField>(fields: F[], generateValue: GenerateValue<F>): Record<string, any> =>
  Object.fromEntries(
    fields.flatMap(field => {
      const { fieldWithContentType, contentTypeFieldName, fieldTypeTimed, fieldTypeLocalDate, collection } = field;
      let fakeData = generateValue(field);
      if (collection) {
        fakeData = fakeData === undefined ? '[]' : `[${fakeData}]`;
      }
      if (fieldWithContentType) {
        return [
          [field.propertyName, fakeData],
          [contentTypeFieldName, "'unknown'"],
        ];
      }
      if (fieldTypeTimed || fieldTypeLocalDate) {
        return [[field.propertyName, `dayjs(${fakeData})`]];
      }
      return [[field.propertyName, fakeData]];
    }),
  );

/** A sample with values that can be serialized to JSON. */
export const generateJsonSample = <F extends BaseApplicationField>(fields: F[], generateValue: GenerateValue<F>): Record<string, any> =>
  Object.fromEntries(
    fields.flatMap(field => {
      const { fieldWithContentType, contentTypeFieldName, collection } = field;
      let fakeData = generateValue(field);
      if (collection) {
        fakeData = fakeData === undefined ? [] : [fakeData];
      }
      if (fieldWithContentType) {
        return [
          [field.propertyName, fakeData],
          [contentTypeFieldName, 'unknown'],
        ];
      }
      return [[field.propertyName, fakeData]];
    }),
  );

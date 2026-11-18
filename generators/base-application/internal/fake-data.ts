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

import { isContentTypeField } from './content-type-fields.ts';

const {
  CommonDBTypes: { BIG_DECIMAL, BOOLEAN, DOUBLE, DURATION, FLOAT, INTEGER, LONG },
  RelationalOnlyDBTypes: { BYTES },
} = fieldTypes;

/** A fake data value serializable to JSON: a date and time is a Date, a blob of bytes its base64 text. */
export type FakeDataValue = string | number | boolean | Date;

/**
 * A format the fake data is written for: a value of a Liquibase CSV, TypeScript code, the input of a Cypress test, or a
 * value serializable to JSON.
 */
export type FakeDataFormat = 'csv' | 'cypress' | 'json-serializable' | 'ts';

const NANOSECONDS = { H: 3_600_000_000_000, M: 60_000_000_000, S: 1_000_000_000 };

/** The nanoseconds of an ISO 8601 duration of hours, minutes and seconds, as Hibernate keeps a duration in a bigint column. */
const durationNanoseconds = (duration: string): number =>
  [...duration.matchAll(/(\d+)([HMS])/g)].reduce(
    (nanoseconds, [, amount, unit]) => nanoseconds + Number(amount) * NANOSECONDS[unit as keyof typeof NANOSECONDS],
    0,
  );

/**
 * A fake data value of a field, serializable to JSON, converted for a format without changing it: a date and time is
 * written as YYYY-MM-DDTHH:mm (YYYY-MM-DDTHH:mm:ss in a CSV), as it is drawn at the minute, a blob of bytes is the file
 * its base64 text tells, a duration in a CSV its nanoseconds.
 */
export const formatFakeData = (field: BaseApplicationField, value: FakeDataValue | undefined, format: FakeDataFormat): any => {
  if (value === undefined || format === 'json-serializable') {
    return value;
  }
  let data = value;
  if (data instanceof Date) {
    data = data.toISOString().slice(0, format === 'csv' ? 19 : 16);
  } else if (field.fieldType === BYTES) {
    data = Buffer.from(data as string, 'base64').toString();
  } else if (format === 'csv' && field.fieldType === DURATION) {
    data = durationNanoseconds(data as string);
  }
  if (format === 'cypress') {
    return data;
  }
  if (format === 'csv') {
    // A text of a pattern can have the separator: it is quoted, a quote written twice as RFC 4180 tells.
    return field.fieldValidate && field.fieldValidateRules?.includes('pattern') ? `"${String(data).replace(/"/g, '""')}"` : data;
  }
  // eslint-disable-next-line no-template-curly-in-string
  if (![BOOLEAN, INTEGER, LONG, FLOAT, '${floatType}', DOUBLE, BIG_DECIMAL].includes(field.fieldType)) {
    data = `'${String(data)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, String.raw`\'`)}'`;
  }
  return data;
};

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
    const max = Number.parseInt(`${field.fieldValidateRulesMax ?? Math.max(32767, min + 1)}`, 10);
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
    // The blob gives the content type of its sample, its content type field is left out.
    fields
      .filter(field => !isContentTypeField(field))
      .flatMap(field => {
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
    // The blob gives the content type of its sample, its content type field is left out.
    fields
      .filter(field => !isContentTypeField(field))
      .flatMap(field => {
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

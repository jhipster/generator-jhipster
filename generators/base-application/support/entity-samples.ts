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
import {
  type FakeDataFormat,
  type FakeDataValue,
  formatFakeData,
  generateJsonSample,
  generateTsSample,
  getFieldFakeDataDomain,
} from '../internal/fake-data.ts';
import type { Entity as BaseApplicationEntity, Field as BaseApplicationField } from '../types.ts';

import type { FakerWithRandexp } from './faker.ts';

export type EntitySampleFormat = FakeDataFormat;

/** A sample of an entity: the value of each field by its name, serializable to JSON. */
export type EntitySample = Record<string, FakeDataValue | undefined>;

export type EntitySamplesBatch<F extends BaseApplicationField = BaseApplicationField> = {
  /** The fields of the samples, a function when choosing them draws from the seed. */
  fields: F[] | ((faker: FakerWithRandexp) => F[]);
  /** The samples to generate, fewer are returned when a required unique field has no value left. */
  count?: number;
  /** The values of each field do not repeat among the samples, as the ones of a unique field. */
  distinct?: boolean;
};

/**
 * Generate samples of an entity, reproducible by the seed, each consumer giving its own.
 * The values are serializable to JSON, each consumer converting them as it needs, like formatEntitySample does.
 * The batches draw one after the other from the seed, and the values of a unique field do not repeat among them.
 * A field that has no value left is undefined, and ends the batch if it is required.
 * The values of a small domain go through the domain when a batch has several samples.
 *
 * @example
 * const [[sample]] = generateEntitySamples(entity, { seed: 'my-seed', batches: [{ fields: entity.fields }] });
 */
export function generateEntitySamples<F extends BaseApplicationField>(
  entity: Pick<BaseApplicationEntity, 'faker' | 'resetFakerSeed'>,
  { seed, batches }: { seed: string; batches: EntitySamplesBatch<F>[] },
): EntitySample[][] {
  entity.resetFakerSeed!(seed);
  const usedValues = new Map<F, unknown[]>();
  const getUsedValues = (field: F) => {
    if (!usedValues.has(field)) {
      usedValues.set(field, []);
    }
    return usedValues.get(field)!;
  };

  return batches.map(({ fields: batchFields, count = 1, distinct = false }) => {
    const fields = typeof batchFields === 'function' ? batchFields(entity.faker!) : batchFields;
    const samples: EntitySample[] = [];
    for (let index = 0; index < count; index++) {
      let exhausted = false;
      const generateValue = (field: F) => {
        const uniqueField = distinct || Boolean(field.unique || field.id);
        const domain = count > 1 && !uniqueField ? getFieldFakeDataDomain(field) : undefined;
        const uniqueValues = getUsedValues(field);
        if (domain && uniqueValues.length >= domain.length) {
          uniqueValues.length = 0;
        }
        const value = field.generateFakeData!('json-serializable', { uniqueValues, unique: uniqueField || domain !== undefined });
        if (value === undefined && uniqueField && (field.id || field.fieldValidationRequired)) {
          exhausted = true;
        }
        return value;
      };

      const sample: EntitySample = Object.fromEntries(fields.map(field => [field.fieldName, generateValue(field)]));
      if (exhausted) {
        break;
      }
      samples.push(sample);
    }
    return samples;
  });
}

/**
 * A sample of an entity written for a format, by the fields it has among the ones given: the values of a Liquibase CSV,
 * TypeScript code, the input of a Cypress test, or values serializable to JSON. The TypeScript and JSON samples give each blob the content type of its
 * file, the content type fields are left out, and a blob of a file a content within its minbytes and maxbytes: the CSV
 * keeps the file of the fake data.
 *
 * @example
 * const [[sample]] = generateEntitySamples(entity, { seed: 'my-seed', batches: [{ fields: entity.fields }] });
 * const tsSample = formatEntitySample(entity.fields, sample, 'ts');
 */
export function formatEntitySample<F extends BaseApplicationField>(
  fields: F[],
  sample: EntitySample,
  format: EntitySampleFormat,
): Record<string, any> {
  const sampleFields = fields.filter(field => field.fieldName in sample);
  const formatValue = (field: F) => formatFakeData(field, sample[field.fieldName], format, { blobWithinSize: true });
  if (format === 'ts') {
    return generateTsSample(sampleFields, formatValue);
  }
  if (format === 'json-serializable') {
    return generateJsonSample(sampleFields, formatValue);
  }
  return Object.fromEntries(sampleFields.map(field => [field.fieldName, formatValue(field)]));
}

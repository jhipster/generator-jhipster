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
import { before, describe, expect, it } from 'expect-node';

import { getConfigWithDefaults } from '../../../lib/jhipster/default-application-options.ts';
import BaseGenerator from '../../base/index.ts';
import { formatDateForChangelog } from '../../base/support/index.ts';
import { getFieldFakeDataDomain } from '../internal/fake-data.ts';

import { formatEntitySample, generateEntitySamples } from './entity-samples.ts';
import { createFaker } from './faker.ts';
import prepareEntityForTemplates, { loadRequiredConfigIntoEntity } from './prepare-entity.ts';
import { prepareCommonFieldForTemplates } from './prepare-field.ts';

const config = getConfigWithDefaults();

describe('generator - base-application - support - generateEntitySamples', () => {
  const generator = { jhipsterConfig: config, log: { warn() {}, debug() {} } };
  Object.setPrototypeOf(generator, BaseGenerator.prototype);
  let entity: any;

  const prepareField = (field: any) => prepareCommonFieldForTemplates(entity, field, generator as any);
  const enumField = (rules: string[] = []) =>
    prepareField({
      fieldName: 'color',
      fieldType: 'Color',
      fieldValues: 'RED,GREEN,BLUE',
      fieldValidateRules: rules,
      fieldIsEnum: true,
      enumValues: ['RED', 'GREEN', 'BLUE'].map(name => ({ name, value: name })),
    });
  const samples = (fields: any[], count: number, seed = 'seed') => generateEntitySamples(entity, { seed, batches: [{ fields, count }] })[0];

  before(async () => {
    entity = prepareEntityForTemplates(
      loadRequiredConfigIntoEntity({ changelogDate: formatDateForChangelog(new Date()), name: 'Entity' } as any, config as any),
      generator as any,
    );
    entity.faker = await createFaker();
    entity.resetFakerSeed = (seed = '') => entity.faker.seed(seed.length + 1);
    entity.changelogDateForRecent = new Date('2026-01-01T00:00:00Z');
  });

  it('should be reproducible by the seed', () => {
    const fields = [prepareField({ fieldName: 'name', fieldType: 'String', columnName: 'name' })];
    expect(samples(fields, 2)).toEqual(samples(fields, 2));
  });

  it('should not repeat a unique value when the seed is repeated by another call', () => {
    const field = prepareField({ fieldName: 'name', fieldType: 'String', fieldValidateRules: ['unique'], columnName: 'name' });
    const values = samples([field], 20).map(sample => sample.name);
    expect(new Set(values).size).toBe(20);
    expect(samples([field], 20).map(sample => sample.name)).toEqual(values);
  });

  it('should not repeat a value of a distinct batch', () => {
    const field = prepareField({
      fieldName: 'code',
      fieldType: 'String',
      fieldValidateRules: ['pattern'],
      fieldValidateRulesPattern: '^[0-9]$',
    });
    const [values] = generateEntitySamples(entity, {
      seed: 'seed',
      batches: [{ fields: [field], count: 10, distinct: true }],
    });
    expect(values.map(sample => sample.code).sort()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('should go through a unique enum', () => {
    const values = samples([enumField(['unique'])], 3).map(sample => sample.color);
    expect([...values].sort()).toEqual(['BLUE', 'GREEN', 'RED']);
  });

  it('should leave an optional unique field undefined past its domain', () => {
    const result = samples([enumField(['unique'])], 4);
    expect(result).toHaveLength(4);
    expect(result[3].color).toBeUndefined();
  });

  it('should return fewer samples when a required unique field has no value left', () => {
    const field = enumField(['required', 'unique']);
    field.fieldValidationRequired = true;
    expect(samples([field], 4)).toHaveLength(3);
  });

  it('should cycle a field of a small domain that is not unique', () => {
    const values = samples([enumField()], 6).map(sample => sample.color);
    expect([...values.slice(0, 3)].sort()).toEqual(['BLUE', 'GREEN', 'RED']);
    expect([...values.slice(3)].sort()).toEqual(['BLUE', 'GREEN', 'RED']);
  });

  it('should list the hundredths of a decimal of a small range as its domain', () => {
    const field = prepareField({ fieldName: 'rate', fieldType: 'BigDecimal' });
    Object.assign(field, { fieldFakeDataMin: 0.07, fieldFakeDataMax: 0.29 });
    const domain = getFieldFakeDataDomain(field)!;
    expect(domain).toHaveLength(23);
    expect([domain[0], domain[1], domain.at(-1)]).toEqual([0.07, 0.08, 0.29]);
  });

  it('should list the single value of a decimal with its min equal to its max as its domain', () => {
    const field = prepareField({ fieldName: 'rate', fieldType: 'Float' });
    Object.assign(field, { fieldFakeDataMin: 3, fieldFakeDataMax: 3 });
    expect(getFieldFakeDataDomain(field)).toEqual([3]);
  });

  it('should not list a decimal of a large range', () => {
    const field = prepareField({ fieldName: 'rate', fieldType: 'Double' });
    Object.assign(field, { fieldFakeDataMin: 0, fieldFakeDataMax: 10.01 });
    expect(getFieldFakeDataDomain(field)).toBeUndefined();
  });

  it('should keep the unique values among the batches of a call', () => {
    const field = enumField(['unique']);
    const [[first], [second]] = generateEntitySamples(entity, {
      seed: 'seed',
      batches: [{ fields: [field] }, { fields: [field] }],
    });
    expect(first.color).not.toBe(second.color);
  });

  it('should choose the fields from the seed', () => {
    const field = prepareField({ fieldName: 'flag', fieldType: 'Boolean' });
    const [[sample]] = generateEntitySamples(entity, {
      seed: 'seed',
      batches: [
        {
          fields: faker => {
            expect(faker).toBe(entity.faker);
            return [field];
          },
        },
      ],
    });
    expect(sample).toHaveProperty('flag');
  });

  it('should detect a repeated value by the written value', () => {
    const field = prepareField({
      fieldName: 'code',
      fieldType: 'String',
      columnName: 'code',
      fieldValidate: true,
      fieldValidateRules: ['unique', 'maxlength'],
      fieldValidateRulesMaxlength: 1,
    });
    const values = samples([field], 10)
      .map(sample => sample.code)
      .filter(value => value !== undefined);
    expect(new Set(values).size).toBe(values.length);
  });

  it('should not repeat a unique date', () => {
    const field = prepareField({ fieldName: 'day', fieldType: 'LocalDate', fieldValidateRules: ['unique'] });
    const values = samples([field], 20).map(sample => sample.day);
    expect(new Set(values).size).toBe(20);
  });

  it('should draw a duration as ISO 8601', () => {
    const [sample] = samples([prepareField({ fieldName: 'time', fieldType: 'Duration' })], 1);
    expect(sample.time).toMatch(/^PT\d+M$/);
  });

  it('should draw a date and time as a Date at the minute', () => {
    const [sample] = samples([prepareField({ fieldName: 'at', fieldType: 'Instant' })], 1);
    expect(sample.at).toBeInstanceOf(Date);
    expect((sample.at as Date).toISOString()).toMatch(/T\d{2}:\d{2}:00\.000Z$/);
  });

  describe('formatEntitySample', () => {
    const at = new Date('2026-01-01T10:15:00.000Z');
    const file = Buffer.from('../fake-data/blob/hipster.txt').toString('base64');
    let fields: any[];

    before(() => {
      fields = [
        prepareField({ fieldName: 'name', fieldType: 'String' }),
        prepareField({ fieldName: 'count', fieldType: 'Integer' }),
        prepareField({ fieldName: 'at', fieldType: 'Instant', fieldTypeTimed: true }),
        prepareField({
          fieldName: 'code',
          fieldType: 'String',
          fieldValidateRules: ['pattern'],
          fieldValidateRulesPattern: '^"?[a-z]+$',
        }),
        prepareField({ fieldName: 'file', fieldType: 'byte[]', fieldTypeBlobContent: 'text' }),
        prepareField({ fieldName: 'time', fieldType: 'Duration' }),
      ];
    });

    it('should write a sample as TypeScript code', () => {
      expect(formatEntitySample(fields, { name: "it's", count: 3, at, code: '"ab', file }, 'ts')).toEqual({
        name: String.raw`'it\'s'`,
        count: 3,
        at: "dayjs('2026-01-01T10:15')",
        code: `'"ab'`,
        file: "'../fake-data/blob/hipster.txt'",
      });
    });

    it('should write a sample as the input of a Cypress test', () => {
      expect(formatEntitySample(fields, { name: "it's", count: 3, at, code: '"ab', file }, 'cypress')).toEqual({
        name: "it's",
        count: 3,
        at: '2026-01-01T10:15',
        code: '"ab',
        file: '../fake-data/blob/hipster.txt',
      });
    });

    it('should write a sample as values serializable to JSON', () => {
      expect(formatEntitySample(fields, { name: "it's", count: 3, at, code: '"ab', file }, 'json-serializable')).toEqual({
        name: "it's",
        count: 3,
        at,
        code: '"ab',
        file,
      });
    });

    it('should write a sample as the values of a Liquibase CSV', () => {
      expect(formatEntitySample(fields, { name: "it's", count: 3, at, code: '"a;b', file, time: 'PT1H2M3S' }, 'csv')).toEqual({
        name: "it's",
        count: 3,
        at: '2026-01-01T10:15:00',
        code: '"""a;b"',
        file: '../fake-data/blob/hipster.txt',
        time: 3_723_000_000_000,
      });
    });

    it('should write only the fields of the sample', () => {
      expect(formatEntitySample(fields, { count: 3 }, 'ts')).toEqual({ count: 3 });
    });
  });
});

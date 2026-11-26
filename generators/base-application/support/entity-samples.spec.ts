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

  it('should take a value of the type of a field whose faker template gives a text of another type', () => {
    const field = prepareField({ fieldName: 'reference', fieldType: 'UUID', fakerTemplate: '{{person.firstName}}' });
    for (const { reference } of samples([field], 5)) {
      expect(reference).toMatch(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i);
    }
  });

  it('should take the value of a faker template of the type of the field', () => {
    const field = prepareField({ fieldName: 'level', fieldType: 'Integer', fakerTemplate: '42' });
    expect(samples([field], 2).map(({ level }) => level)).toEqual([42, 42]);
  });

  it('should take the value of a faker template of an enum, a boolean and a decimal field', () => {
    const color = prepareField({ ...enumField(), fakerTemplate: 'GREEN' });
    const active = prepareField({ fieldName: 'active', fieldType: 'Boolean', fakerTemplate: 'true' });
    const ratio = prepareField({ fieldName: 'ratio', fieldType: 'Float', fakerTemplate: '12.5' });
    const price = prepareField({ fieldName: 'price', fieldType: 'BigDecimal', fakerTemplate: '-0.25e2' });
    expect(
      samples([color, active, ratio, price], 2).map(sample => [sample.color, sample.active, String(sample.ratio), String(sample.price)]),
    ).toEqual([
      ['GREEN', true, '12.5', '-25'],
      ['GREEN', true, '12.5', '-25'],
    ]);
  });

  for (const [fieldType, fakerTemplate] of [
    ['Integer', '08'],
    ['Long', '1.5'],
    ['Integer', ' 12 '],
    ['Float', '0x1A'],
    ['Double', ' 12 '],
    ['BigDecimal', '.5'],
    ['Boolean', 'yes'],
    ['Integer', '2147483648'],
    ['Long', '9007199254740992'],
    ['Float', '167773'],
    ['Double', '-1e14'],
  ]) {
    it(`should not take the text '${fakerTemplate}' of a faker template as a ${fieldType}`, () => {
      const field = prepareField({ fieldName: 'value', fieldType, fakerTemplate });
      for (const { value } of samples([field], 3)) {
        // The text of the template would be taken as its value, the number it reads as for a number field.
        expect(value).not.toBe(fieldType === 'Boolean' ? fakerTemplate : Number(fakerTemplate));
        expect(typeof value).toBe(fieldType === 'Boolean' ? 'boolean' : 'number');
      }
    });
  }

  it('should take the value of a faker template at the limits of the type of a number field', () => {
    const level = prepareField({ fieldName: 'level', fieldType: 'Integer', fakerTemplate: '2147483647' });
    const total = prepareField({ fieldName: 'total', fieldType: 'Long', fakerTemplate: '-9007199254740991' });
    expect(samples([level, total], 1).map(sample => [sample.level, sample.total])).toEqual([[2147483647, -9007199254740991]]);
  });

  it('should not take the value of a faker template out of the min and the max of a field', () => {
    const field = prepareField({
      fieldName: 'level',
      fieldType: 'Integer',
      fieldValidateRules: ['min', 'max'],
      fieldValidateRulesMin: 1,
      fieldValidateRulesMax: 10,
      fakerTemplate: '42',
    });
    for (const { level } of samples([field], 3)) {
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(10);
    }
  });

  it('should take the value of a faker template within the decimal min and max of a field', () => {
    // The min and the max of a decimal field are texts, as a JDL gives them.
    const decimalField = (fieldName: string, fieldValidateRulesMin: string, fieldValidateRulesMax: string, fakerTemplate: string) =>
      prepareField({
        fieldName,
        fieldType: 'BigDecimal',
        fieldValidateRules: ['min', 'max'],
        fieldValidateRulesMin,
        fieldValidateRulesMax,
        fakerTemplate,
      });
    const ratio = decimalField('ratio', '0.5', '0.99', '0.644');
    const tiny = decimalField('tiny', '0.0001', '0.001', '0.000253');
    expect(samples([ratio, tiny], 2).map(sample => [sample.ratio, sample.tiny])).toEqual([
      [0.644, 0.000253],
      [0.644, 0.000253],
    ]);
    expect([ratio.fieldValidateRulesMin, ratio.fieldValidateRulesMax]).toEqual(['0.5', '0.99']);
  });

  it('should take the domain of an enum and of a boolean whose faker template gives a text of another type', () => {
    const color = prepareField({ ...enumField(), fakerTemplate: '{{person.firstName}}' });
    const active = prepareField({ fieldName: 'active', fieldType: 'Boolean', fakerTemplate: 'yes' });
    const drawn = samples([color, active], 3);
    expect(drawn.map(sample => sample.color).toSorted()).toEqual(['BLUE', 'GREEN', 'RED']);
    expect([...new Set(drawn.map(sample => sample.active))].toSorted()).toEqual([false, true]);
  });

  it('should warn once of a faker template that gives a text of another type', () => {
    const warnings: string[] = [];
    const warningGenerator = { jhipsterConfig: config, log: { warn: (message: string) => warnings.push(message), debug() {} } };
    Object.setPrototypeOf(warningGenerator, BaseGenerator.prototype);
    const field = prepareCommonFieldForTemplates(
      entity,
      { fieldName: 'reference', fieldType: 'UUID', fakerTemplate: '{{person.firstName}}' } as any,
      warningGenerator as any,
    );
    samples([field], 3);
    samples([field], 3);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(
      /^The faker template \{\{person\.firstName\}\} of the field reference gives '[^']+', which is not a value of the type UUID: its fake data takes values of that type instead\.$/,
    );
  });

  it('should draw a value of a pattern within the minlength and the maxlength of its field', () => {
    const field = prepareField({
      fieldName: 'code',
      fieldType: 'String',
      fieldValidateRules: ['required', 'minlength', 'maxlength', 'pattern'],
      fieldValidateRulesMinlength: 3,
      fieldValidateRulesMaxlength: 10,
      fieldValidateRulesPattern: '^[a-z]+$',
    });
    const values = samples([field], 30).map(sample => sample.code);
    // A value left undefined is not a text: tested as one, it would be 'undefined', of the pattern, and toEqual ignores it.
    expect(values.filter(value => typeof value !== 'string' || !/^[a-z]{3,10}$/.test(value))).toStrictEqual([]);
  });

  it('should draw a value of a pattern with a minlength above the repetitions it draws by default', () => {
    const field = prepareField({
      fieldName: 'code',
      fieldType: 'String',
      fieldValidateRules: ['minlength', 'pattern'],
      fieldValidateRulesMinlength: 12,
      fieldValidateRulesPattern: '^[a-z]+$',
    });
    const values = samples([field], 30).map(sample => sample.code);
    expect(values.filter(value => typeof value !== 'string' || !/^[a-z]{12,}$/.test(value))).toStrictEqual([]);
  });

  it('should draw a value of nested repetitions with a minlength within the 255 characters of its column', () => {
    const field = prepareField({
      fieldName: 'name',
      fieldType: 'String',
      fieldValidateRules: ['minlength', 'pattern'],
      fieldValidateRulesMinlength: 80,
      fieldValidateRulesPattern: '^[a-z]+( [a-z]+)*$',
    });
    const values = samples([field], 30).map(sample => sample.name);
    expect(
      values.filter(value => typeof value !== 'string' || value.length < 80 || value.length > 255 || !/^[a-z]+( [a-z]+)*$/.test(value)),
    ).toStrictEqual([]);
  });

  it('should draw a value of a pattern within its maxlength instead of cutting it', () => {
    const field = prepareField({
      fieldName: 'site',
      fieldType: 'String',
      fieldValidateRules: ['minlength', 'maxlength', 'pattern'],
      fieldValidateRulesMinlength: 6,
      fieldValidateRulesMaxlength: 12,
      fieldValidateRulesPattern: String.raw`^[a-z]+\.com$`,
    });
    const values = samples([field], 30).map(sample => sample.site);
    expect(values.filter(value => typeof value !== 'string' || !/^[a-z]{2,8}\.com$/.test(value))).toStrictEqual([]);
  });

  it('should draw a value of a pattern with a back reference within the minlength of its field', () => {
    const field = prepareField({
      fieldName: 'code',
      fieldType: 'String',
      fieldValidateRules: ['minlength', 'pattern'],
      fieldValidateRulesMinlength: 20,
      fieldValidateRulesPattern: String.raw`^(a+)\1$`,
    });
    const values = samples([field], 30).map(sample => sample.code);
    expect(values.filter(value => typeof value !== 'string' || value.length < 20 || !/^(a+)\1$/.test(value))).toStrictEqual([]);
  });

  it('should warn once of a pattern giving no value within the length of its field', () => {
    const warnings: string[] = [];
    const warningGenerator = { jhipsterConfig: config, log: { warn: (message: string) => warnings.push(message), debug() {} } };
    Object.setPrototypeOf(warningGenerator, BaseGenerator.prototype);
    const field = prepareCommonFieldForTemplates(
      entity,
      { fieldName: 'code', fieldType: 'String', fieldValidateRules: ['pattern'], fieldValidateRulesPattern: '^[a-z]{300}$' } as any,
      warningGenerator as any,
    );
    samples([field], 3);
    samples([field], 3);
    expect(warnings).toStrictEqual([
      'The pattern ^[a-z]{300}$ of the field code gives no value of 0 to 255 characters (its minlength, and its maxlength or the 255 characters of its column): its fake data may be dropped or longer than its column.',
    ]);
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

  describe('with a blob of a file', () => {
    const file = '../fake-data/blob/hipster.png';
    const base64 = (text: string) => Buffer.from(text).toString('base64');
    // fieldTypeBinary is prepared by the common generator.
    const blobField = (rules: Record<string, number> = {}) =>
      prepareField({
        fieldName: 'image',
        fieldType: 'byte[]',
        fieldTypeBinary: true,
        fieldTypeBlobContent: 'image',
        fieldValidateRules: Object.keys(rules),
        ...Object.fromEntries(
          Object.entries(rules).map(([rule, value]) => [`fieldValidateRules${rule[0].toUpperCase()}${rule.slice(1)}`, value]),
        ),
      });
    const formats = (field: any) => {
      const [sample] = samples([field], 1);
      return {
        ts: formatEntitySample([field], sample, 'ts').image,
        json: formatEntitySample([field], sample, 'json-serializable').image,
        csv: formatEntitySample([field], sample, 'csv').image,
      };
    };

    it('should give the file of the fake data within its minbytes and maxbytes', () => {
      expect(formats(blobField({ minbytes: 2, maxbytes: 10000 }))).toEqual({ ts: `'${file}'`, json: base64(file), csv: file });
    });

    it('should cut the file over its maxbytes, written as base64 in a CSV instead of the file', () => {
      expect(formats(blobField({ maxbytes: 8 }))).toEqual({ ts: "'../fake-'", json: base64('../fake-'), csv: base64('../fake-') });
    });

    it('should complete the file under its minbytes to the characters a client measures it by', () => {
      // A client measures 3 bytes by 4 characters of base64: 30 bytes take 40 characters.
      const text = `${file}${'X'.repeat(11)}`;
      expect(formats(blobField({ minbytes: 30 }))).toEqual({ ts: `'${text}'`, json: base64(text), csv: base64(text) });
    });

    it('should fail when no text fits both its minbytes and its maxbytes', () => {
      expect(() => samples([blobField({ minbytes: 7, maxbytes: 8 })], 1)).toThrow(/minbytes 7 and maxbytes 8/);
    });
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

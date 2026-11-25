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
import { basename, resolve } from 'node:path';

import { testBootstrapEntities } from '../../../../test/support/bootstrap-tests.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  // describe('blueprint support', () => testBlueprintSupport(generator, { bootstrapGenerator: true }));

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators - snapshot', () => {
      expect(result.composedMockedGenerators).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('with entities', () => {
    // A transient and a @NotSortable field, as the JDL annotations give them.
    const orderNote = { fieldName: 'orderNote', fieldType: 'String', transient: true };
    const orderSecret = { fieldName: 'orderSecret', fieldType: 'String', notSortable: true };

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({})
        .withJHipsterConfig({}, [
          { name: 'Reference', changelogDate: '20200101000000', fields: [{ fieldName: 'id', fieldType: 'UUID' }] },
          {
            name: 'CustomerOrder',
            changelogDate: '20200101000100',
            fields: [
              { fieldName: 'orderCode', fieldType: 'String' },
              { fieldName: 'orderReference', fieldType: 'UUID' },
              { fieldName: 'orderText', fieldType: 'TextBlob' },
              { fieldName: 'orderFile', fieldType: 'Blob' },
              orderNote,
              orderSecret,
            ],
          },
        ]);
    });

    it('should not offer to sort the lists by a UUID primary key', () => {
      const entity = result.entities!.Reference as Record<string, any>;
      expect(entity.fields.find((field: Record<string, any>) => field.id).fieldSupportsSortBy).toBe(false);
    });

    it('should sort the lists by the stored fields that can be sorted', () => {
      const entity = result.entities!.CustomerOrder as Record<string, any>;
      const fieldSupportsSortBy = (fieldName: string) =>
        entity.fields.find((field: Record<string, any>) => field.fieldName === fieldName).fieldSupportsSortBy;
      expect(fieldSupportsSortBy('orderCode')).toBe(true);
      expect(fieldSupportsSortBy('orderReference')).toBe(false);
      expect(fieldSupportsSortBy('orderText')).toBe(true);
      expect(fieldSupportsSortBy('orderFile')).toBe(false);
      expect(fieldSupportsSortBy('orderNote')).toBe(false);
      expect(fieldSupportsSortBy('orderSecret')).toBe(false);
    });
  });

  describe('with the field types of a request body', () => {
    const fieldTypes = ['Long', 'BigDecimal', 'Integer', 'Float', 'Double', 'Boolean', 'UUID', 'String', 'Instant', 'TextBlob', 'Level'];

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({})
        .withJHipsterConfig({}, [
          { name: 'LongId', changelogDate: '20200101000000' },
          { name: 'IntegerId', changelogDate: '20200101000100', fields: [{ fieldName: 'id', fieldType: 'Integer' }] },
          { name: 'UuidId', changelogDate: '20200101000200', fields: [{ fieldName: 'id', fieldType: 'UUID' }] },
          { name: 'StringId', changelogDate: '20200101000300', fields: [{ fieldName: 'id', fieldType: 'String' }] },
          {
            name: 'Typed',
            changelogDate: '20200101000400',
            fields: fieldTypes.map(fieldType =>
              fieldType === 'Level' ?
                { fieldName: 'fieldLevel', fieldType, fieldValues: 'LOW,HIGH' }
              : { fieldName: `field${fieldType}`, fieldType },
            ),
          },
        ]);
    });

    it('should give each field the JSON values it takes', () => {
      const entity = result.entities!.Typed as Record<string, any>;
      expect(
        Object.fromEntries(
          entity.fields
            .filter((field: Record<string, any>) => !field.id)
            .map((field: Record<string, any>) => [field.fieldName.slice('field'.length), field.jsonType]),
        ),
      ).toEqual({
        Long: 'number-or-text',
        BigDecimal: 'number-or-text',
        Integer: 'number',
        Float: 'number',
        Double: 'number',
        Boolean: 'boolean',
        UUID: 'uuid',
        String: 'text',
        Instant: 'text',
        TextBlob: 'text',
        Level: 'text',
      });
    });

    it('should give each primary key the JSON values of its id', () => {
      const jsonType = (name: string) => (result.entities![name] as Record<string, any>).primaryKey.jsonType;
      expect(jsonType('LongId')).toBe('number-or-text');
      expect(jsonType('IntegerId')).toBe('number');
      expect(jsonType('UuidId')).toBe('uuid');
      expect(jsonType('StringId')).toBe('text');
    });

    it('should derive a flag for each JSON type of a field and of a primary key', () => {
      const jsonTypeFlags = (data: Record<string, any>) =>
        Object.fromEntries(Object.entries(data).filter(([key]) => key.startsWith('jsonType') && key !== 'jsonType'));
      const entity = result.entities!.Typed as Record<string, any>;
      expect(jsonTypeFlags(entity.fields.find((field: Record<string, any>) => field.fieldName === 'fieldLong'))).toEqual({
        jsonTypeNumber: false,
        jsonTypeNumberOrText: true,
        jsonTypeBoolean: false,
        jsonTypeUuid: false,
        jsonTypeText: false,
      });
      expect(jsonTypeFlags((result.entities!.UuidId as Record<string, any>).primaryKey)).toEqual({
        jsonTypeNumber: false,
        jsonTypeNumberOrText: false,
        jsonTypeBoolean: false,
        jsonTypeUuid: true,
        jsonTypeText: false,
      });
    });
  });

  testBootstrapEntities(generator);
});

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

  testBootstrapEntities(generator);
});

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

import { beforeEach, describe, expect, it } from 'esmocha';

import { getConfigWithDefaults } from '../../../lib/jhipster/default-application-options.ts';
import BaseGenerator from '../../base/index.ts';
import { formatDateForChangelog } from '../../base/support/index.ts';
import { convertFieldBlobType } from '../internal/types/field-types.ts';

import prepareEntityForTemplates, { loadRequiredConfigIntoEntity } from './prepare-entity.ts';
import { getEnumValuesWithCustomValues, prepareCommonFieldForTemplates } from './prepare-field.ts';

const defaultConfig = getConfigWithDefaults();

describe('generator - base-application - support - prepareField', () => {
  const defaultGenerator = { jhipsterConfig: defaultConfig };
  Object.setPrototypeOf(defaultGenerator, BaseGenerator.prototype);

  const defaultEntity = prepareEntityForTemplates(
    loadRequiredConfigIntoEntity({ changelogDate: formatDateForChangelog(new Date()), name: 'Entity' } as any, defaultConfig as any),
    defaultGenerator as BaseGenerator,
  );

  describe('prepareFieldForTemplates', () => {
    describe('when called', () => {
      let field: any = { fieldName: 'name', fieldType: 'String' };
      beforeEach(() => {
        field = prepareCommonFieldForTemplates(defaultEntity, field, defaultGenerator as any);
      });
      it('should prepare path correctly', () => {
        expect(field.path).toEqual(['name']);
      });
    });

    describe('when fieldTypeBlobContent is json', () => {
      it('should convert byte[] into TextBlob and keep json marker', () => {
        const field: any = { fieldType: 'byte[]', fieldTypeBlobContent: 'json' };

        convertFieldBlobType(field);

        expect(field).toMatchObject({
          fieldType: 'TextBlob',
          fieldTypeBlobContent: 'json',
        });
      });

      it('should treat json-clob as text-like blob data', () => {
        const preparedField = prepareCommonFieldForTemplates(
          defaultEntity,
          { fieldName: 'payload', fieldType: 'TextBlob', fieldTypeBlobContent: 'json' } as any,
          defaultGenerator as any,
        );

        expect(preparedField.blobContentTypeText).toBe(true);
        expect(preparedField.fieldWithContentType).toBe(false);
      });
    });
  });

  describe('getEnumValuesWithCustomValues', () => {
    describe('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error testing invalid arguments
        expect(() => getEnumValuesWithCustomValues()).toThrow(/^Enumeration values must be passed to get the formatted values\.$/);
      });
    });
    describe('when passing an empty string', () => {
      it('should fail', () => {
        expect(() => getEnumValuesWithCustomValues('')).toThrow(/^Enumeration values must be passed to get the formatted values\.$/);
      });
    });
    describe('when passing a string without custom enum values', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE, ENGLAND, ICELAND')).toEqual([
          { name: 'FRANCE', value: 'FRANCE' },
          { name: 'ENGLAND', value: 'ENGLAND' },
          { name: 'ICELAND', value: 'ICELAND' },
        ]);
      });
    });
    describe('when passing a string with some custom enum values', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE(france), ENGLAND, ICELAND (viking_country)')).toEqual([
          { name: 'FRANCE', value: 'france' },
          { name: 'ENGLAND', value: 'ENGLAND' },
          { name: 'ICELAND', value: 'viking_country' },
        ]);
      });
    });
    describe('when passing a string custom enum values for each value', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE(france), ENGLAND(england), ICELAND (iceland)')).toEqual([
          { name: 'FRANCE', value: 'france' },
          { name: 'ENGLAND', value: 'england' },
          { name: 'ICELAND', value: 'iceland' },
        ]);
      });
    });
  });
});

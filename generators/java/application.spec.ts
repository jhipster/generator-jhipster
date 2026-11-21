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

import { describe, expect, it } from 'expect-node';

import { mutateData } from '../../lib/utils/object.ts';

import * as entityData from './application.ts';

import { mutateMockedCompleteData, mutateMockedData, prepareMutationTest } from '#testing';

describe('application mutation test', () => {
  for (const [name, data] of Object.entries(prepareMutationTest(entityData))) {
    it(`expects ${name} to match snapshot`, () => {
      expect(mutateMockedData(...data)).toMatchSnapshot();
    });
    it(`expects ${name} not to override existing properties`, () => {
      expect(Object.keys(mutateMockedCompleteData(...data))).toHaveLength(0);
    });
  }

  describe('mutateField', () => {
    it('marks a direct MapStruct expression field as transient', () => {
      const field: any = { mapstructExpression: 'java(s.getName())' };

      mutateData(field, { transient: entityData.mutateField.transient });

      expect(field.transient).toBe(true);
    });
  });

  describe('mutateValidatedField', () => {
    const validatorsOf = (field: Record<string, unknown>): string => {
      const data: any = { ...field };
      mutateData(data, { javaFieldValidatorsPartial: entityData.mutateValidatedField.javaFieldValidatorsPartial });
      return data.javaFieldValidatorsPartial.trim();
    };

    it('requires a required blob', () => {
      expect(validatorsOf({ fieldTypeBytes: true, fieldValidationRequired: true })).toBe('@NotNull');
    });

    it('limits the size of a blob of a file by its minbytes and maxbytes', () => {
      const blob = { fieldTypeBytes: true, fieldValidateRulesMinbytes: 2, fieldValidateRulesMaxbytes: 8 };
      expect(validatorsOf({ ...blob, fieldValidationMinBytes: true, fieldValidationMaxBytes: true })).toBe('@Size(min = 2, max = 8)');
      expect(validatorsOf({ ...blob, fieldValidationMinBytes: true })).toBe('@Size(min = 2)');
      expect(validatorsOf({ ...blob, fieldValidationMaxBytes: true })).toBe('@Size(max = 8)');
    });

    it('does not limit the size of a text blob nor of a ByteBuffer by bytes', () => {
      const rules = { fieldValidationMinBytes: true, fieldValidateRulesMinbytes: 2 };
      expect(validatorsOf({ ...rules, fieldTypeBytes: true, blobContentTypeText: true })).toBe('');
      expect(validatorsOf({ ...rules, fieldTypeByteBuffer: true })).toBe('');
    });
  });
});

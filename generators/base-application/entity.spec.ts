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

import * as entityData from './entity.ts';

import { mutateMockedCompleteData, mutateMockedData, prepareMutationTest } from '#testing';

describe('mutation object test', () => {
  for (const [name, data] of Object.entries(prepareMutationTest(entityData))) {
    it(`expects ${name} to match snapshot`, () => {
      expect(mutateMockedData(...data)).toMatchSnapshot();
    });
    it(`expects ${name} not to override existing properties`, () => {
      expect(Object.keys(mutateMockedCompleteData(...data))).toHaveLength(0);
    });
  }
});

describe('mutateField fake data range', () => {
  const fakeDataRange = (field: Record<string, unknown>) => {
    const data: Record<string, any> = { fieldName: 'value', ...field };
    mutateData(data, entityData.mutateField);
    return [data.fieldFakeDataMin, data.fieldFakeDataMax];
  };

  for (const [title, field, expected] of [
    ['an Integer without min nor max', { fieldType: 'Integer' }, [0, 32767]],
    ['a Long with both', { fieldType: 'Long', fieldValidateRulesMin: 3, fieldValidateRulesMax: 9 }, [3, 9]],
    ['an Integer with a max alone', { fieldType: 'Integer', fieldValidateRulesMax: -5 }, [-2147483647, -5]],
    ['an Integer with a min alone', { fieldType: 'Integer', fieldValidateRulesMin: 40000 }, [40000, 2147483647]],
    ['a Long with a min alone', { fieldType: 'Long', fieldValidateRulesMin: 40000 }, [40000, Number.MAX_SAFE_INTEGER]],
    ['a Long with a max alone', { fieldType: 'Long', fieldValidateRulesMax: 0 }, [-Number.MAX_SAFE_INTEGER, 0]],
    ['a Float with a max alone', { fieldType: 'Float', fieldValidateRulesMax: -5 }, [-167772.16, -5]],
    ['a Double with a min alone', { fieldType: 'Double', fieldValidateRulesMin: 1 }, [1, Number.MAX_SAFE_INTEGER / 100]],
    ['a BigDecimal with a max alone', { fieldType: 'BigDecimal', fieldValidateRulesMax: 10 }, [-Number.MAX_SAFE_INTEGER / 100, 10]],
    ['a Long with a min given as a text', { fieldType: 'Long', fieldValidateRulesMin: '40000' }, [40000, Number.MAX_SAFE_INTEGER]],
    ['a String', { fieldType: 'String', fieldValidateRulesMax: -5 }, [undefined, undefined]],
  ] as const) {
    it(`gives the range of ${title}`, () => {
      expect(fakeDataRange(field)).toEqual(expected);
    });
  }
});

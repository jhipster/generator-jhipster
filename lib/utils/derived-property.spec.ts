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

import { describe, expect, it } from 'esmocha';

import type { DerivedPropertiesOf } from '../command/index.ts';

import { buildMutateDataForProperty } from './derived-property.ts';
import { mutateData } from './object.ts';

describe('buildMutateDataForProperty', () => {
  it('should return an object with mutate data for derived properties', () => {
    expect(buildMutateDataForProperty('test', ['unit', 'integration', 'e2e', 'no'])).toMatchObject({
      testUnit: expect.any(Function),
      testIntegration: expect.any(Function),
      testE2e: expect.any(Function),
      testNo: expect.any(Function),
    });
  });
  it('returned object should be a mutateData param', () => {
    const data: { test: 'unit' | 'integration' | 'e2e' | 'no' } & DerivedPropertiesOf<'test', 'unit' | 'integration' | 'e2e' | 'no'> = {
      test: 'unit',
    } as any;
    mutateData(data, buildMutateDataForProperty('test', ['unit', 'integration', 'e2e', 'no']));
    expect(data).toMatchObject({
      test: 'unit',
      testUnit: true,
      testIntegration: false,
      testE2e: false,
      testNo: false,
    });
  });
});

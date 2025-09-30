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

import { describe, expect, it } from 'esmocha';

import type { MutateDataParam } from './object.ts';
import { removeFieldsWithNullishValues } from './object.ts';

const _shouldAcceptStringProperties: MutateDataParam<{ str: string }> = {
  str: 'baz',
};

_shouldAcceptStringProperties.str satisfies string | ((ctx: { str: string }) => string) | undefined;

const _shouldAcceptNumberProperties: MutateDataParam<{ nr: number }> = {
  nr: 1,
};

_shouldAcceptNumberProperties.nr satisfies number | ((ctx: { nr: number }) => number) | undefined;

describe('generator - base - support - config', () => {
  describe('deepCleanup', () => {
    it('should cleanup objects', () => {
      expect(removeFieldsWithNullishValues({ foo: 'bar', foo2: undefined, foo3: null })).toMatchObject({ foo: 'bar' });
    });
    it('should cleanup property objects', () => {
      expect(removeFieldsWithNullishValues({ nested: { foo: 'bar', foo2: undefined, foo3: null } })).toMatchObject({
        nested: { foo: 'bar' },
      });
    });
    it('should cleanup property arrays', () => {
      expect(removeFieldsWithNullishValues({ foo: ['bar', undefined, null] })).toMatchObject({ foo: ['bar'] });
    });
  });
});

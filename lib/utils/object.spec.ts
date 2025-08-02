import { describe, expect, it } from 'esmocha';
import { removeFieldsWithNullishValues } from './object.ts';

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

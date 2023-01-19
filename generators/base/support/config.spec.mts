import { jestExpect as expect } from 'mocha-expect-snapshot';
import { removeFieldsWithUnsetValues } from './config.mjs';

describe('generator - base - support - config', () => {
  describe('deepCleanup', () => {
    it('should cleanup objects', () => {
      expect(removeFieldsWithUnsetValues({ foo: 'bar', foo2: undefined, foo3: null })).toMatchObject({ foo: 'bar' });
    });
    it('should cleanup property objects', () => {
      expect(removeFieldsWithUnsetValues({ nested: { foo: 'bar', foo2: undefined, foo3: null } })).toMatchObject({
        nested: { foo: 'bar' },
      });
    });
    it('should cleanup property arrays', () => {
      expect(removeFieldsWithUnsetValues({ foo: ['bar', undefined, null] })).toMatchObject({ foo: ['bar'] });
    });
  });
});

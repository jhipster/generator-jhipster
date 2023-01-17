import { jestExpect as expect } from 'mocha-expect-snapshot';
import { deepCleanup } from './config.mjs';

describe('generator - base - support - config', () => {
  describe('deepCleanup', () => {
    it('should cleanup objects', () => {
      expect(deepCleanup({ foo: 'bar', foo2: undefined, foo3: null })).toMatchObject({ foo: 'bar' });
    });
    it('should cleanup property objects', () => {
      expect(deepCleanup({ nested: { foo: 'bar', foo2: undefined, foo3: null } })).toMatchObject({ nested: { foo: 'bar' } });
    });
    it('should cleanup property arrays', () => {
      expect(deepCleanup({ foo: ['bar', undefined, null] })).toMatchObject({ foo: ['bar'] });
    });
  });
});

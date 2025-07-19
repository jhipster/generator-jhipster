import { describe, expect, it } from 'esmocha';
import { addSpringFactory } from './spring-factories.js';

describe('generator - server - support - spring-factories', () => {
  describe('addSpringFactory', () => {
    it('should add the first property', () => {
      // @ts-expect-error testing invalid arguments
      expect(addSpringFactory({ key: 'key.prop', value: 'value' })(null)).toBe('key.prop = value');
    });
    it('should add wrap long value', () => {
      // @ts-expect-error testing invalid arguments
      expect(addSpringFactory({ key: 'key.prop', value: '12345678901234567890123456789012345678901234567890' })(null)).toBe(
        'key.prop = 12345678901234567890123456789012345678901234567890',
      );
    });
    it('should add a new value to a property', () => {
      expect(
        addSpringFactory({ key: 'key.prop', value: 'new.value' })(`key.prop=\\
value`),
      ).toBe('key.prop = value,new.value');
    });
    it('should add a new property', () => {
      expect(
        addSpringFactory({ key: 'key.prop2', value: 'new.value' })(`key.prop = value
`),
      ).toBe(`key.prop = value
key.prop2 = new.value`);
    });
  });
});

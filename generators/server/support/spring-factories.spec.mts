import { jestExpect as expect } from 'mocha-expect-snapshot';

import { addSpringFactory } from './spring-factories.mjs';

describe('generator - server - support - spring-factories', () => {
  describe('addSpringFactory', () => {
    it('should add the first property', () => {
      expect(addSpringFactory({ key: 'key.prop', value: 'value' })(null)).toBe(`key.prop=\\
value
`);
    });
    it('should add a new value to a property', () => {
      expect(
        addSpringFactory({ key: 'key.prop', value: 'new.value' })(`key.prop=\\
value
`)
      ).toBe(`key.prop=\\
new.value,\\
value
`);
    });
    it('should add a new property', () => {
      expect(
        addSpringFactory({ key: 'key.prop2', value: 'new.value' })(`key.prop=\\
value
`)
      ).toBe(`key.prop=\\
value

key.prop2=\\
new.value
`);
    });
  });
});

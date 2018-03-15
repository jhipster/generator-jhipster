import { expect } from 'chai';

import { isPromise } from '../../../react-jhipster';

describe('Promise util', () => {
  describe('isPromise', () => {
    it('should return false when passed object is not promise like', () => {
      const inp = {};
      expect(isPromise(inp)).to.eql(false);
    });
    it('should return true when passed object is promise like', () => {
      const inp = Promise.resolve(true);
      expect(isPromise(inp)).to.eql(true);
    });
  });
});

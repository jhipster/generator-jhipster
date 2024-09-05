import assert from 'assert';
import { describe, it } from 'esmocha';
import { stringHashCode } from './string.js';

describe('generator - base - support - string', () => {
  describe('::stringHashCode', () => {
    it('calculates hash', () => {
      assert.equal(stringHashCode('some text'), 642107175);
    });
  });
});

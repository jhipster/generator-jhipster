import assert from 'yeoman-assert';

import { deepFind, stringHashCode } from '../generators/utils.mjs';
import { javadoc } from '../generators/server/support/index.mjs';

describe('utils - generator', () => {
  describe('::javadoc', () => {
    describe('when passing a negative or nil increment', () => {
      it('returns the comment with no increment', () => {
        assert.textEqual(javadoc('whatever', -42), '/**\n * whatever\n */');
        assert.textEqual(javadoc('whatever', 0), '/**\n * whatever\n */');
      });
    });
    describe('when passing a positive increment', () => {
      it('returns the comment with the increment', () => {
        assert.textEqual(javadoc('whatever', 1), ' /**\n  * whatever\n  */');
      });
    });
    describe('when passing a nil comment', () => {
      it('inserts an empty comment instead of failing', () => {
        assert.textEqual(javadoc(null, 1), ' /**\n  * \n  */');
      });
    });
    describe('when passing a comment containing double quotes', () => {
      it('escapes the quotes', () => {
        assert.textEqual(javadoc('Comment="KO"', 1), ' /**\n  * Comment=\\"KO\\"\n  */');
      });
    });
  });
  describe('::deepFind function', () => {
    const jsonData = {
      foo11: 'foo11value',
      fooNested: { foo21: 'foo21value' },
      foo21: 'foo21value',
    };
    describe('the key is found in the object that is searched', () => {
      it('returns the value associated to the key', () => {
        const value = deepFind(jsonData, 'foo21');
        assert.textEqual(value, 'foo21value');
      });
    });
    describe('the key is not found in the object that is searched', () => {
      it('returns undefined', () => {
        const value = deepFind(jsonData, 'foo123');
        assert.textEqual(`${value}`, 'undefined');
      });
    });
  });
  describe('::stringHashCode', () => {
    it('calculates hash', () => {
      assert.equal(stringHashCode('some text'), 642107175);
    });
  });
});

'use strict';

const expect = require('chai').expect,
    isNilOrEmpty = require('../../../lib/utils/string_utils').isNilOrEmpty;

describe('::isNilOrEmpty', function() {
  describe('when passing a nil object', function() {
    it('returns true', function() {
      expect(isNilOrEmpty(null)).to.be.true;
    });
  });
  describe('when passing an undefined object', function() {
    it('returns true', function() {
      expect(isNilOrEmpty(undefined)).to.be.true;
    });
  });
  describe('when passing an empty string', function() {
    it('returns true', function() {
      expect(isNilOrEmpty('')).to.be.true;
    });
  });
  describe('when passing a valid string', function() {
    it('returns false', function() {
      expect(isNilOrEmpty('ABC')).to.be.false;
    });
  });
});

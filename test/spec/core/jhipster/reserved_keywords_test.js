'use strict';

const expect = require('chai').expect,
    isReserved = require('../../../../lib/core/jhipster/reserved_keywords').isReserved;

describe('ReservedKeywords', function () {
  describe('::isReserved', function () {
    describe('when passing a nil or empty keyword', function () {
      it('returns false', function () {
        expect(isReserved()).to.be.false;
        expect(isReserved('')).to.be.false;
      });
    });
    describe('when passing a valid keyword', function() {
      it('returns false', function() {
        expect(isReserved('ValidKeyword')).to.be.false;
      });
    });
    describe('when passing an invalid keyword, no matter the case', function() {
      it('returns true', function() {
        expect(isReserved('Account')).to.be.true;
        expect(isReserved('account')).to.be.true;
        expect(isReserved('ACCOUNT')).to.be.true;
      });
    });
  });
});

'use strict';

const expect = require('chai').expect,
  VALIDATIONS = require('../../../../lib/core/jhipster/validations').VALIDATIONS,
  exists = require('../../../../lib/core/jhipster/validations').exists,
  needsValue = require('../../../../lib/core/jhipster/validations').needsValue;

describe('VALIDATIONS', function () {
  describe('::exists', function () {
    describe('when checking for a valid validation', function () {
      it('returns true', function () {
        expect(exists(VALIDATIONS.MAXBYTES)).to.be.true;
      });
    });
    describe('when checking for an invalid validation', function () {
      it('returns false', function () {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
  describe('::needsValue', function () {
    describe('when checking whether a validation needs a value', function () {
      it('returns so', function () {
        expect(needsValue(VALIDATIONS.MAXLENGTH)).to.be.true;
        expect(needsValue(VALIDATIONS.REQUIRED)).to.be.false;
      });
    });
  });
});

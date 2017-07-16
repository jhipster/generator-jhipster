

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const VALIDATIONS = require('../../../../lib/core/jhipster/validations').VALIDATIONS;
const exists = require('../../../../lib/core/jhipster/validations').exists;
const needsValue = require('../../../../lib/core/jhipster/validations').needsValue;

describe('VALIDATIONS', () => {
  describe('::exists', () => {
    describe('when checking for a valid validation', () => {
      it('returns true', () => {
        expect(exists(VALIDATIONS.MAXBYTES)).to.be.true;
      });
    });
    describe('when checking for an invalid validation', () => {
      it('returns false', () => {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
  describe('::needsValue', () => {
    describe('when checking whether a validation needs a value', () => {
      it('returns so', () => {
        expect(needsValue(VALIDATIONS.MAXLENGTH)).to.be.true;
        expect(needsValue(VALIDATIONS.REQUIRED)).to.be.false;
      });
    });
  });
});

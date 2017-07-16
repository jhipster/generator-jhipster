

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const UNARY_OPTIONS = require('../../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;
const exists = require('../../../../lib/core/jhipster/unary_options').exists;

describe('UNARY_OPTIONS', () => {
  describe('::exists', () => {
    describe('when checking for a valid unary option', () => {
      it('returns true', () => {
        expect(exists(UNARY_OPTIONS.SKIP_CLIENT)).to.be.true;
      });
    });
    describe('when checking for an invalid unary option', () => {
      it('returns false', () => {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});

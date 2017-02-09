'use strict';

const expect = require('chai').expect,
  UNARY_OPTIONS = require('../../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
  exists = require('../../../../lib/core/jhipster/unary_options').exists;

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

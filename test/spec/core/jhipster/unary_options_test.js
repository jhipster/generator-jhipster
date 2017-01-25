'use strict';

const expect = require('chai').expect,
  UNARY_OPTIONS = require('../../../../lib/core/jhipster/unary_options').UNARY_OPTIONS,
  exists = require('../../../../lib/core/jhipster/unary_options').exists;

describe('UNARY_OPTIONS', function () {
  describe('::exists', function () {
    describe('when checking for a valid unary option', function () {
      it('returns true', function () {
        expect(exists(UNARY_OPTIONS.SKIP_CLIENT)).to.be.true;
      });
    });
    describe('when checking for an invalid unary option', function () {
      it('returns false', function () {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});

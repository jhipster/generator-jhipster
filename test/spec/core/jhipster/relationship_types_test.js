'use strict';

const expect = require('chai').expect,
    RELATIONSHIP_TYPES = require('../../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    exists = require('../../../../lib/core/jhipster/relationship_types').exists;

describe('RELATIONSHIP_TYPES', function () {
  describe('::exists', function () {
    describe('when checking for a valid unary relationship type', function () {
      it('returns true', function () {
        expect(exists(RELATIONSHIP_TYPES.MANY_TO_ONE)).to.be.true;
      });
    });
    describe('when checking for an invalid relationship type', function () {
      it('returns false', function () {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});

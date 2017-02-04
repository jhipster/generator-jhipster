'use strict';

const expect = require('chai').expect,
  RELATIONSHIP_TYPES = require('../../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES,
  exists = require('../../../../lib/core/jhipster/relationship_types').exists;

describe('RELATIONSHIP_TYPES', () => {
  describe('::exists', () => {
    describe('when checking for a valid unary relationship type', () => {
      it('returns true', () => {
        expect(exists(RELATIONSHIP_TYPES.MANY_TO_ONE)).to.be.true;
      });
    });
    describe('when checking for an invalid relationship type', () => {
      it('returns false', () => {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});

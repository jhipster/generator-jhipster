'use strict';

const expect = require('chai').expect,
  BINARY_OPTIONS = require('../../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
  BINARY_OPTION_VALUE = require('../../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES,
  exists = require('../../../../lib/core/jhipster/binary_options').exists;

describe('BINARY_OPTIONS', function () {
  describe('::exists', function () {
    describe('when checking for a valid binary option', function () {
      it('returns true', function () {
        expect(exists(BINARY_OPTIONS.DTO, BINARY_OPTION_VALUE.dto.MAPSTRUCT)).to.be.true;
      });
    });
    describe('when checking for an invalid binary option', function () {
      it('returns false', function () {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});

'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    camelCase = require('../../../lib/utils/string_utils').camelCase,
    isNilOrEmpty = require('../../../lib/utils/string_utils').isNilOrEmpty;

describe('StringUtils', () => {
  describe('::camelCase', () => {
    describe('when passing a valid string', () => {
      it('camel-cases it', () => {
        expect(camelCase('e')).to.eq('e');
        expect(camelCase('entity')).to.eq('entity');
        expect(camelCase('Entity')).to.eq('entity');
        expect(camelCase('EntityA')).to.eq('entityA');
        expect(camelCase('EntityAN')).to.eq('entityAN');
        expect(camelCase('Entity_AN')).to.eq('entityAN');
        expect(camelCase('_entity_AN')).to.eq('entityAN');
        expect(camelCase('_entit--y_AN---')).to.eq('entityAN');
        expect(camelCase('En tity_AN ')).to.eq('entityAN');
      });
    });
    describe('when passing an invalid parameter', () => {
      describe('as it is nil', () => {
        it('fails', () => {
          try {
            camelCase();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('as it is empty', () => {
        it('returns it', () => {
          expect(camelCase('')).to.eq('');
        });
      });
    });
  });
  describe('::isNilOrEmpty', () => {
    describe('when passing a nil object', () => {
      it('returns true', () => {
        expect(isNilOrEmpty(null)).to.be.true;
      });
    });
    describe('when passing an undefined object', () => {
      it('returns true', () => {
        expect(isNilOrEmpty(undefined)).to.be.true;
      });
    });
    describe('when passing an empty string', () => {
      it('returns true', () => {
        expect(isNilOrEmpty('')).to.be.true;
      });
    });
    describe('when passing a valid string', () => {
      it('returns false', () => {
        expect(isNilOrEmpty('ABC')).to.be.false;
      });
    });
  });
});

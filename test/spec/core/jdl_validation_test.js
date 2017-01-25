'use strict';

const expect = require('chai').expect,
  JDLValidation = require('../../../lib/core/jdl_validation'),
  VALIDATIONS = require('../../../lib/core/jhipster/validations').VALIDATIONS;

describe('JDLValidation', function () {
  describe('::new', function () {
    describe('when not passing any argument', function () {
      it("defaults on the 'required' validation", function () {
        var validation = new JDLValidation();
        expect(validation.name).to.eq('required');
        expect(validation.value).to.eq('');
      });
    });
    describe('when passing arguments', function () {
      it('uses them', function () {
        var validation = new JDLValidation({
          name: 'min',
          value: 42
        });
        expect(validation.name).to.eq('min');
        expect(validation.value).to.eq(42);
      });
    });
  });
  describe('::isValid', function () {
    describe('when checking the validity of an invalid object', function () {
      describe('because it is nil or invalid', function () {
        it('returns false', function () {
          expect(JDLValidation.isValid(null)).to.be.false;
          expect(JDLValidation.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', function () {
        it('returns false', function () {
          expect(JDLValidation.isValid({})).to.be.false;
        });
      });
      describe('without a valid name attribute', function () {
        it('returns false', function () {
          expect(JDLValidation.isValid({name: 'something'})).to.be.false;
        });
      });
      describe('with a valid name but an invalid value', function () {
        it('returns false', function () {
          expect(JDLValidation.isValid({name: VALIDATIONS.MIN})).to.be.false;
        });
      });
    });
    describe('when checking the validity of a valid object', function () {
      it('returns true', function () {
        expect(JDLValidation.isValid({name: VALIDATIONS.REQUIRED})).to.be.true;
        expect(JDLValidation.isValid({
          name: VALIDATIONS.MIN,
          value: 42
        })).to.be.true;
      });
    });
  });
  describe('#toString', function () {
    describe('with no value', function () {
      it('stringifies its content', function () {
        var validation = new JDLValidation();
        expect(validation.toString()).to.eq('required');
      });
    });
    describe('with a value', function () {
      it('stringifies its content', function () {
        var args = {
          name: 'min',
          value: 42
        };
        var validation = new JDLValidation(args);
        expect(validation.toString()).to.eq(`${args.name}(${args.value})`);
      });
    });
  });
});

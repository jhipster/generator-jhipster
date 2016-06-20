'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLField = require('../../../lib/core/jdl_field'),
    JDLValidation = require('../../../lib/core/jdl_validation'),
    VALIDATIONS = require('../../../lib/core/jhipster/validations').VALIDATIONS;

describe('JDLField', function () {
  describe('::new', function () {
    describe('when not passing any argument', function () {
      it('fails', function () {
        try {
          new JDLField();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the name or the type', function () {
      it('fails', function () {
        try {
          new JDLField({name: null, type: 'String'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          new JDLField({name: 'abc', type: null});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing arguments', function () {
      it('creates a new instance', function () {
        var args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [new JDLValidation()]
        };
        var field = new JDLField(args);
        expect(field.name).to.eq(args.name);
        expect(field.type).to.eq(args.type);
        expect(field.comment).to.eq(args.comment);
        expect(field.validations).to.deep.eq(args.validations);
      });
    });
  });
  describe('::isValid', function () {
    describe('when checking the validity of an invalid object', function () {
      describe('because it is nil or undefined', function () {
        it('returns false', function () {
          expect(JDLField.isValid(null)).to.be.false;
          expect(JDLField.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', function () {
        it('returns false', function () {
          expect(JDLField.isValid({type: 'String'})).to.be.false;
        });
      });
      describe('without a type attribute', function () {
        it('returns false', function () {
          expect(JDLField.isValid({name: 'myField'})).to.be.false;
        });
      });
      describe('because its validations are invalid', function () {
        it('returns false', function () {
          expect(
              JDLField.isValid({
                name: 'myField',
                type: 'String',
                validations: [{
                  value: 42
                }]
              })
          ).to.be.false;
        });
      });
    });
    describe('when checking the validity of a valid object', function () {
      it('returns true', function () {
        expect(JDLField.isValid({name: 'myField', type: 'String'})).to.be.true;
      });
    });
  });
  describe('#addValidation', function () {
    describe('when adding an invalid validation', function () {
      it('fails', function () {
        var field = new JDLField({
          name: 'abc',
          type: 'String',
          comment: 'comment'
        });
        try {
          field.addValidation(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          field.addValidation({name: VALIDATIONS.MIN});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid validation', function () {
      it('works', function () {
        var field = new JDLField({
          name: 'abc',
          type: 'String',
          comment: 'comment'
        });
        var validation = {name: VALIDATIONS.MIN, value: 42};
        field.addValidation(validation);
        expect(field.validations).to.deep.eq({min: validation});
      });
    });
  });
  describe('#toString', function () {
    describe('without comment', function () {
      it('stringifies the fields', function () {
        var args = {
          name: 'abc',
          type: 'String'
        };
        var field = new JDLField(args);
        expect(field.toString()).to.eq(`${args.name} ${args.type}`);
      });
    });
    describe('without any validation', function () {
      it('stringifies the fields', function () {
        var args = {
          name: 'abc',
          type: 'String',
          comment: 'comment'
        };
        var field = new JDLField(args);
        expect(field.toString()).to.eq(`/**\n * ${args.comment}\n */\n`
            + `${args.name} ${args.type}`);
      });
    });
    describe('with everything', function () {
      it('stringifies the field', function () {
        var args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [new JDLValidation(), new JDLValidation({
            name: 'minlength',
            value: 42
          })]
        };
        var field = new JDLField(args);
        expect(field.toString()).to.eq(`/**\n * ${args.comment}\n */\n`
            + `${args.name} ${args.type} ${args.validations[0].name} `
            + `${args.validations[1].name}(${args.validations[1].value})`);
      });
    });
  });
});

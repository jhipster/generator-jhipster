

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');
const VALIDATIONS = require('../../../lib/core/jhipster/validations').VALIDATIONS;

describe('JDLField', () => {
  describe('::new', () => {
    describe('when not passing any argument', () => {
      it('fails', () => {
        try {
          new JDLField();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the name or the type', () => {
      it('fails', () => {
        try {
          new JDLField({ name: null, type: 'String' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          new JDLField({ name: 'abc', type: null });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing arguments', () => {
      it('creates a new instance', () => {
        const args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [new JDLValidation()]
        };
        const field = new JDLField(args);
        expect(field.name).to.eq(args.name);
        expect(field.type).to.eq(args.type);
        expect(field.comment).to.eq(args.comment);
        expect(field.validations).to.deep.eq(args.validations);
      });
    });
    describe('when passing a reserved keyword as name', () => {
      it('fails', () => {
        try {
          new JDLField({ name: 'class', type: 'String' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
  });
  describe('::isValid', () => {
    describe('when checking the validity of an invalid object', () => {
      describe('because it is nil or undefined', () => {
        it('returns false', () => {
          expect(JDLField.isValid(null)).to.be.false;
          expect(JDLField.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', () => {
        it('returns false', () => {
          expect(JDLField.isValid({ type: 'String' })).to.be.false;
        });
      });
      describe('without a type attribute', () => {
        it('returns false', () => {
          expect(JDLField.isValid({ name: 'myField' })).to.be.false;
        });
      });
      describe('with a reserved keyword as name', () => {
        it('returns false', () => {
          expect(
            JDLField.isValid({ name: 'class', type: 'String' })
          ).to.be.false;
        });
      });
      describe('because its validations are invalid', () => {
        it('returns false', () => {
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
    describe('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(JDLField.isValid({ name: 'myField', type: 'String' })).to.be.true;
      });
    });
  });
  describe('#addValidation', () => {
    describe('when adding an invalid validation', () => {
      it('fails', () => {
        const field = new JDLField({
          name: 'abc',
          type: 'String',
          comment: 'comment'
        });
        try {
          field.addValidation(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The passed validation must be valid.\nErrors: No validation');
        }
        try {
          field.addValidation({ name: VALIDATIONS.MIN });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The passed validation must be valid.\nErrors: No value');
        }
      });
    });
    describe('when adding a valid validation', () => {
      it('works', () => {
        const field = new JDLField({
          name: 'abc',
          type: 'String',
          comment: 'comment'
        });
        const validation = { name: VALIDATIONS.MIN, value: 42 };
        field.addValidation(validation);
        expect(field.validations).to.deep.eq({ min: validation });
      });
    });
  });
  describe('#toString', () => {
    describe('without comment', () => {
      it('stringifies the fields', () => {
        const args = {
          name: 'abc',
          type: 'String'
        };
        const field = new JDLField(args);
        expect(field.toString()).to.eq(`${args.name} ${args.type}`);
      });
    });
    describe('without any validation', () => {
      it('stringifies the fields', () => {
        const args = {
          name: 'abc',
          type: 'String',
          comment: 'comment'
        };
        const field = new JDLField(args);
        expect(field.toString()).to.eq(`/**\n * ${args.comment}\n */\n`
          + `${args.name} ${args.type}`);
      });
    });
    describe('with everything', () => {
      it('stringifies the field', () => {
        const args = {
          name: 'abc',
          type: 'String',
          comment: 'comment',
          validations: [new JDLValidation(), new JDLValidation({
            name: 'minlength',
            value: 42
          })]
        };
        const field = new JDLField(args);
        expect(field.toString()).to.eq(`/**\n * ${args.comment}\n */\n`
          + `${args.name} ${args.type} ${args.validations[0].name} `
          + `${args.validations[1].name}(${args.validations[1].value})`);
      });
    });
  });
});

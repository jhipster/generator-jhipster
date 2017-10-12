

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');

const fail = expect.fail;

describe('JDLEntity', () => {
  describe('::new', () => {
    describe('when not passing any argument', () => {
      it('fails', () => {
        try {
          new JDLEntity();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the name', () => {
      it('fails', () => {
        try {
          new JDLEntity({ name: null, comment: 'My entity' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the table name', () => {
      it('uses the names as value', () => {
        const entity = new JDLEntity({ name: 'Abc' });
        expect(entity.tableName).to.eq('Abc');
      });
    });
    describe('when passing arguments', () => {
      it('creates a new instance', () => {
        const args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment',
          fields: [new JDLField({
            name: 'abc',
            type: 'String',
            comment: 'comment',
            validations: [new JDLValidation()]
          })]
        };
        const entity = new JDLEntity(args);
        expect(entity.name).to.eq(args.name);
        expect(entity.tableName).to.eq(args.tableName);
        expect(entity.comment).to.eq(args.comment);
        expect(entity.fields).to.deep.eq(args.fields);
      });
    });
    describe('when passing a reserved keyword as name', () => {
      it('fails', () => {
        try {
          new JDLEntity({ name: 'class' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
  });
  describe('::isValid', () => {
    describe('when checking the validity of an invalid object', () => {
      describe('because it is nil or invalid', () => {
        it('returns false', () => {
          expect(JDLEntity.isValid(null)).to.be.false;
          expect(JDLEntity.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', () => {
        it('returns false', () => {
          expect(
            JDLEntity.isValid({ tableName: 'Something', fields: [] })
          ).to.be.false;
        });
      });
      describe('with a reserved keyword as name', () => {
        it('returns false', () => {
          expect(
            JDLEntity.isValid({ name: 'class' })
          ).to.be.false;
        });
      });
      describe('without a table name', () => {
        it('returns false', () => {
          expect(
            JDLEntity.isValid({ name: 'Something', fields: [] })
          ).to.be.false;
        });
      });
      describe('because its fields are invalid', () => {
        it('returns false', () => {
          expect(
            JDLEntity.isValid({
              name: 'Something',
              tableName: 't_something',
              fields: [{
                type: 'String',
                comment: 'comment',
                validations: []
              }]
            })
          ).to.be.false;
        });
      });
    });
    describe('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(
          JDLEntity.isValid({ name: 'Valid', tableName: 't_valid', fields: [] })
        ).to.be.true;
      });
    });
  });
  describe('#addField', () => {
    describe('when adding an invalid field', () => {
      it('fails', () => {
        const entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String'
        });
        try {
          entity.addField(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq(`The passed field '' must be valid for entity '${entity.name}'.\nErrors: No field`);
        }
        try {
          entity.addField({ name: 'myField' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq(`The passed field 'myField' must be valid for entity '${entity.name}'.\nErrors: No field type`);
        }
      });
    });
    describe('when adding a valid field', () => {
      it('works', () => {
        const entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String'
        });
        const validField = new JDLField({ name: 'myField', type: 'String' });
        entity.addField(validField);
        expect(entity.fields).to.deep.eq({ myField: validField });
      });
    });
  });
  describe('#toString', () => {
    describe('without a comment', () => {
      it('stringifies its content', () => {
        const args = {
          name: 'Abc',
          tableName: 'String'
        };
        const entity = new JDLEntity(args);
        expect(entity.toString()).to.eq(`entity ${args.name} (${args.tableName})`);
      });
    });
    describe('without fields', () => {
      it('stringifies its content', () => {
        const args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment'
        };
        const entity = new JDLEntity(args);
        expect(entity.toString()).to.eq(
          `/**
 * ${args.comment}
 */
entity ${args.name} (${args.tableName})`
        );
      });
    });
    describe('with fields', () => {
      it('stringifies its content', () => {
        const entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String',
          comment: 'Entity comment'
        });
        const field1 = new JDLField({
          name: 'myField',
          type: 'Integer',
          comment: 'Field comment',
          validations: [new JDLValidation()]
        });
        const field2 = new JDLField({
          name: 'myOtherField',
          type: 'Long'
        });
        entity.addField(field1);
        entity.addField(field2);
        expect(entity.toString()).to.eq(
          `/**
 * ${entity.comment}
 */
entity ${entity.name} (${entity.tableName}) {
  /**
   * ${field1.comment}
   */
  ${field1.name} ${field1.type} ${field1.validations[0]},
  ${field2.name} ${field2.type}
}`
        );
      });
    });
  });
});

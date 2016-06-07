'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLEntity = require('../../../lib/core/jdl_entity'),
    JDLField = require('../../../lib/core/jdl_field'),
    JDLValidation = require('../../../lib/core/jdl_validation');

describe('JDLEntity', function () {
  describe('::new', function () {
    describe('when not passing any argument', function () {
      it('fails', function () {
        try {
          new JDLEntity();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the name', function () {
      it('fails', function () {
        try {
          new JDLEntity({name: null, comment: 'My entity'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing the table name', function () {
      it('uses the names as value', function () {
        var entity = new JDLEntity({name: 'Abc'});
        expect(entity.tableName).to.eq('Abc');
      });
    });
    describe('when passing arguments', function () {
      it('creates a new instance', function () {
        var args = {
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
        var entity = new JDLEntity(args);
        expect(entity.name).to.eq(args.name);
        expect(entity.tableName).to.eq(args.tableName);
        expect(entity.comment).to.eq(args.comment);
        expect(entity.fields).to.deep.eq(args.fields);
      });
    });
  });
  describe('::isValid', function () {
    describe('when checking the validity of an invalid object', function () {
      describe('because it is nil or invalid', function () {
        it('returns false', function () {
          expect(JDLEntity.isValid(null)).to.be.false;
          expect(JDLEntity.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', function () {
        it('returns false', function () {
          expect(
              JDLEntity.isValid({tableName: 'Something', fields: []})
          ).to.be.false;
        });
      });
      describe('without a table name', function () {
        it('returns false', function () {
          expect(
              JDLEntity.isValid({name: 'Something', fields: []})
          ).to.be.false;
        });
      });
      describe('because its entities are invalid', function () {
        it('returns false', function () {
          expect(
              JDLEntity.isValid({
                name: 'Something', tableName: 't_something', fields: [{
                  type: 'String',
                  comment: 'comment',
                  validations: []
                }]
              })
          ).to.be.false;
        });
      });
    });
    describe('when checking the validity of a valid object', function () {
      it('returns true', function () {
        expect(
            JDLEntity.isValid({name: 'Valid', tableName: 't_valid', fields: []})
        ).to.be.true;
      });
    });
  });
  describe('#addField', function () {
    describe('when adding an invalid field', function () {
      it('fails', function () {
        var entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String'
        });
        try {
          entity.addField(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          entity.addField({name: 'myField'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid field', function () {
      it('works', function () {
        var entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String'
        });
        var validField = {name: 'myField', type: 'String'};
        entity.addField(validField);
        expect(entity.fields).to.deep.eq({myField: validField});
      });
    });
  });
  describe('#toString', function () {
    describe('without a comment', function () {
      it('stringifies its content', function () {
        var args = {
          name: 'Abc',
          tableName: 'String'
        };
        var entity = new JDLEntity(args);
        expect(entity.toString()).to.eq(`entity ${args.name} (${args.tableName})`);
      });
    });
    describe('without fields', function () {
      it('stringifies its content', function () {
        var args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment'
        };
        var entity = new JDLEntity(args);
        expect(entity.toString()).to.eq(
            `/**
 * ${args.comment}
 */
entity ${args.name} (${args.tableName})`
        );
      });
    });
    describe('with fields', function () {
      it('stringifies its content', function () {
        var args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'Entity comment',
          fields: [
            new JDLField({
              name: 'myField',
              type: 'Integer',
              comment: 'Field comment',
              validations: [new JDLValidation()]
            }), new JDLField({
              name: 'myOtherField',
              type: 'Long'
            })]
        };
        var entity = new JDLEntity(args);
        expect(entity.toString()).to.eq(
            `/**
 * ${args.comment}
 */
entity ${args.name} (${args.tableName}) {
  /**
   * ${args.fields[0].comment}
   */
  ${args.fields[0].name} ${args.fields[0].type} ${args.fields[0].validations[0]},
  ${args.fields[1].name} ${args.fields[1].type}
}`
        );
      });
    });
  });
});

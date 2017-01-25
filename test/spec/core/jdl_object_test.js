'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  BINARY_OPTIONS = require('../../../lib/core/jhipster/binary_options'),
  UNARY_OPTIONS = require('../../../lib/core/jhipster/unary_options'),
  RELATIONSHIP_TYPES = require('../../../lib/core/jhipster/relationship_types'),
  JDLObject = require('../../../lib/core/jdl_object'),
  JDLEntity = require('../../../lib/core/jdl_entity'),
  JDLField = require('../../../lib/core/jdl_field'),
  JDLValidation = require('../../../lib/core/jdl_validation'),
  JDLEnum = require('../../../lib/core/jdl_enum'),
  JDLRelationship = require('../../../lib/core/jdl_relationship'),
  JDLUnaryOption = require('../../../lib/core/jdl_unary_option'),
  JDLBinaryOption = require('../../../lib/core/jdl_binary_option');

describe('JDLObject', function () {
  describe('#addEntity', function () {
    describe('when adding an invalid entity', function () {
      it('fails', function () {
        var object = new JDLObject();
        try {
          object.addEntity(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          object.addEntity({
            name: 'Something', tableName: 't_something', fields: [{
              type: 'String',
              comment: 'comment',
              validations: []
            }]
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid entity', function () {
      it('works', function () {
        var object = new JDLObject();
        var entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
        expect(object.entities[entity.name]).to.deep.eq(entity);
      });
    });
    describe('when adding an entity with the same name', function () {
      it('replaces the former one', function () {
        var object = new JDLObject();
        var entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
        var entity2 = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid2',
          fields: []
        });
        object.addEntity(entity2);
        expect(object.entities[entity.name]).to.deep.eq(entity2);
      });
    });
  });
  describe('#addEnum', function () {
    describe('when adding an invalid enum', function () {
      it('fails', function () {
        var object = new JDLObject();
        try {
          object.addEnum(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          object.addEnum({values: ['A', 'B']});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid enum', function () {
      it('works', function () {
        var object = new JDLObject();
        var enumObject = new JDLEnum({name: 'Valid'});
        object.addEnum(enumObject);
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject);
      });
    });
    describe('when adding an enum with the same name', function () {
      it('replaces the old one', function () {
        var object = new JDLObject();
        var enumObject = new JDLEnum({name: 'Valid'});
        object.addEnum(enumObject);
        var enumObject2 = new JDLEnum({name: 'Valid', values: ['A', 'B']});
        object.addEnum(enumObject2);
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject2);
      });
    });
  });
  describe('#addRelationship', function () {
    describe('when adding an invalid relationship', function () {
      it('fails', function () {
        var object = new JDLObject();
        try {
          object.addRelationship(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          object.addRelationship({
            from: {},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid relationship', function () {
      it('works', function () {
        var object = new JDLObject();
        var relationship = new JDLRelationship({
          from: {name: 'Valid2', tableName: 't_valid2', fields: []},
          to: {name: 'Valid', tableName: 't_valid', fields: []},
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
        expect(object.relationships.relationships.ManyToMany[relationship.getId()]).to.deep.eq(relationship);
      });
    });
    describe('when adding twice the same relationship', function () {
      it("doesn't do anything", function () {
        var object = new JDLObject();
        var relationship = new JDLRelationship({
          from: {name: 'Valid2', tableName: 't_valid2', fields: []},
          to: {name: 'Valid', tableName: 't_valid', fields: []},
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
        object.addRelationship(relationship);
        expect(Object.keys(object.relationships.relationships.ManyToMany).length).to.eq(1);
      });
    });
  });
  describe('#addOption', function () {
    describe('when adding an invalid option', function () {
      it('fails', function () {
        var object = new JDLObject();
        try {
          object.addOption(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          object.addOption({});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          object.addOption({
            name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT,
            type: 'WrongType'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when adding a valid option', function () {
      it('works', function () {
        var object = new JDLObject();
        var emptyOption = new JDLUnaryOption({name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT});
        object.addOption(emptyOption);
      });
    });
  });
  describe('#toString', function () {
    it('stringifies the JDL object', function () {
      var object = new JDLObject();
      var entityA = new JDLEntity({name: 'EntityA', tableName: 't_entity_a'});
      var field = new JDLField({name: 'myField', type: 'String'});
      field.addValidation(new JDLValidation());
      entityA.addField(field);
      object.addEntity(entityA);
      var entityB = new JDLEntity({name: 'EntityB', tableName: 't_entity_b'});
      object.addEntity(entityB);
      var enumObject = new JDLEnum({name: 'MyEnum', values: ['A', 'B']});
      object.addEnum(enumObject);
      var relationship = new JDLRelationship({
        from: entityA,
        to: entityB,
        type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.ONE_TO_ONE,
        injectedFieldInFrom: 'entityB',
        injectedFieldInTo: 'entityA(myField)'
      });
      object.addRelationship(relationship);
      var option = new JDLUnaryOption({name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT});
      option.excludeEntity(entityA);
      object.addOption(option);
      var option2 = new JDLBinaryOption({
        name: BINARY_OPTIONS.BINARY_OPTIONS.DTO,
        value: BINARY_OPTIONS.BINARY_OPTION_VALUES.dto.MAPSTRUCT
      });
      option2.addEntity(entityB);
      object.addOption(option2);
      expect(object.toString()).to.eq(
        `${entityA.toString()}
${entityB.toString()}
${enumObject.toString()}

${relationship.toString()}

${option.toString()}
${option2.toString()}
`);
    });
  });
});

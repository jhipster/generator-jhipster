/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const BINARY_OPTIONS = require('../../../lib/core/jhipster/binary_options');
const UNARY_OPTIONS = require('../../../lib/core/jhipster/unary_options');
const RELATIONSHIP_TYPES = require('../../../lib/core/jhipster/relationship_types');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');
const JDLEnum = require('../../../lib/core/jdl_enum');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');

describe('JDLObject', () => {
  describe('#addEntity', () => {
    context('when adding an invalid entity', () => {
      const object = new JDLObject();

      context('such as a nil object', () => {
        it('fails', () => {
          try {
            object.addEntity(null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(error.message).to.eq('The entity must be valid in order to be added.\nErrors: No entity');
          }
        });
      });
      context('such as an incomplete entity', () => {
        try {
          object.addEntity({
            name: 'Something',
            tableName: 't_something',
            fields: [{
              type: 'String',
              comment: 'comment',
              validations: []
            }]
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq('The entity must be valid in order to be added.\nErrors: For field #1: No field name');
        }
      });
    });
    context('when adding a valid entity', () => {
      let object = null;
      let entity = null;

      before(() => {
        object = new JDLObject();
        entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
      });

      it('works', () => {
        expect(object.entities[entity.name]).to.deep.eq(entity);
      });
    });
    context('when adding an entity with the same name', () => {
      let object = null;
      let entity = null;
      let entity2 = null;

      before(() => {
        object = new JDLObject();
        entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
        entity2 = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid2',
          fields: []
        });
        object.addEntity(entity2);
      });

      it('replaces the former one', () => {
        expect(object.entities[entity.name]).to.deep.eq(entity2);
      });
    });
  });
  describe('#addEnum', () => {
    context('when adding an invalid enum', () => {
      const object = new JDLObject();

      context('such as a nil enum', () => {
        it('fails', () => {
          try {
            object.addEnum(null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(error.message).to.eq('The enum must be valid in order to be added.\nErrors: No enumeration');
          }
        });
      });
      context('such as an incomplete enum', () => {
        it('fails', () => {
          try {
            object.addEnum({ values: ['A', 'B'] });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(error.message).to.eq('The enum must be valid in order to be added.\nErrors: No enumeration name');
          }
        });
      });
    });
    context('when adding a valid enum', () => {
      let object = null;
      let enumObject = null;

      before(() => {
        object = new JDLObject();
        enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
      });

      it('works', () => {
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject);
      });
    });
    context('when adding an enum with the same name', () => {
      let object = null;
      let enumObject = null;
      let enumObject2 = null;

      before(() => {
        object = new JDLObject();
        enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
        enumObject2 = new JDLEnum({ name: 'Valid', values: ['A', 'B'] });
        object.addEnum(enumObject2);
      });

      it('replaces the old one', () => {
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject2);
      });
    });
  });
  describe('#addRelationship', () => {
    context('when adding an invalid relationship', () => {
      const object = new JDLObject();

      context('such as a nil relationship', () => {
        it('fails', () => {
          try {
            object.addRelationship(null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(error.message).to.eq('The relationship must be valid in order to be added.\nErrors: No relationship');
          }
        });
      });
      context('such as an incomplete relationship', () => {
        it('fails', () => {
          try {
            object.addRelationship({
              from: {},
              to: { name: 'Valid', tableName: 't_valid', fields: [] },
              type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
              injectedFieldInFrom: 'something'
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(
              error.message
            ).to.eq('The relationship must be valid in order to be added.\nErrors: Wrong source entity: No entity name, No table name, No fields object');
          }
        });
      });
    });
    context('when adding a valid relationship', () => {
      let object = null;
      let relationship = null;

      before(() => {
        object = new JDLObject();
        relationship = new JDLRelationship({
          from: { name: 'Valid2', tableName: 't_valid2', fields: [] },
          to: { name: 'Valid', tableName: 't_valid', fields: [] },
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
      });

      it('works', () => {
        expect(object.relationships.relationships.ManyToMany[relationship.getId()]).to.deep.eq(relationship);
      });
    });
    context('when adding twice the same relationship', () => {
      let object = null;

      before(() => {
        object = new JDLObject();
        const relationship = new JDLRelationship({
          from: { name: 'Valid2', tableName: 't_valid2', fields: [] },
          to: { name: 'Valid', tableName: 't_valid', fields: [] },
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
        object.addRelationship(relationship);
      });

      it('doesn\'t do anything', () => {
        expect(Object.keys(object.relationships.relationships.ManyToMany)).to.have.lengthOf(1);
      });
    });
  });
  describe('#addOption', () => {
    context('when adding an invalid option', () => {
      const object = new JDLObject();

      context('such as a nil option', () => {
        it('fails', () => {
          try {
            object.addOption(null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(error.message).to.eq('The option must be valid in order to be added.\nErrors: No option');
          }
        });
      });
      context('such as an empty object', () => {
        it('fails', () => {
          try {
            object.addOption({});
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(
              error.message
            ).to.eq('The option must be valid in order to be added.\nErrors: No option name, No entity names, No excluded names, No type');
          }
        });
      });
      context('such as a wrong option/value', () => {
        it('fails', () => {
          try {
            object.addOption({
              name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT,
              type: 'WrongType'
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
            expect(
              error.message
            ).to.eq('The option must be valid in order to be added.\nErrors: No entity names, No excluded names, No type');
          }
        });
      });
    });
    context('when adding a valid option', () => {
      it('works', () => {
        new JDLObject().addOption(new JDLUnaryOption({ name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT }));
      });
    });
  });
  describe('#toString', () => {
    let object = null;
    let entityA = null;
    let entityB = null;
    let enumObject = null;
    let relationship = null;
    let option = null;
    let option2 = null;

    before(() => {
      object = new JDLObject();
      entityA = new JDLEntity({ name: 'EntityA', tableName: 't_entity_a' });
      const field = new JDLField({ name: 'myField', type: 'String' });
      field.addValidation(new JDLValidation());
      entityA.addField(field);
      object.addEntity(entityA);
      entityB = new JDLEntity({ name: 'EntityB', tableName: 't_entity_b' });
      object.addEntity(entityB);
      enumObject = new JDLEnum({ name: 'MyEnum', values: ['A', 'B'] });
      object.addEnum(enumObject);
      relationship = new JDLRelationship({
        from: entityA,
        to: entityB,
        type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.ONE_TO_ONE,
        injectedFieldInFrom: 'entityB',
        injectedFieldInTo: 'entityA(myField)'
      });
      object.addRelationship(relationship);
      option = new JDLUnaryOption({ name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT });
      option.excludeEntity(entityA);
      object.addOption(option);
      option2 = new JDLBinaryOption({
        name: BINARY_OPTIONS.BINARY_OPTIONS.DTO,
        value: BINARY_OPTIONS.BINARY_OPTION_VALUES.dto.MAPSTRUCT
      });
      option2.addEntity(entityB);
      object.addOption(option2);
    });

    it('stringifies the JDL object', () => {
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

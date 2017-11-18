/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const JDLApplication = require('../../../lib/core/jdl_application');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');
const JDLEnum = require('../../../lib/core/jdl_enum');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');

describe('JDLObject', () => {
  describe('#addApplication', () => {
    describe('when adding an invalid application', () => {
      it('fails', () => {
        const object = new JDLObject();
        try {
          object.addApplication();
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message.indexOf('No application')).not.to.eq(-1);
        }
      });
    });
    describe('when adding a valid application', () => {
      it('works', () => {
        const object = new JDLObject();
        const application = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
        object.addApplication(application);
        expect(object.applications[application.config.baseName]).to.deep.eq(application);
      });
    });
  });
  describe('#addEntity', () => {
    describe('when adding an invalid entity', () => {
      it('fails', () => {
        const object = new JDLObject();
        try {
          object.addEntity(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The entity must be valid in order to be added.\nErrors: No entity');
        }
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
    describe('when adding a valid entity', () => {
      it('works', () => {
        const object = new JDLObject();
        const entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
        expect(object.entities[entity.name]).to.deep.eq(entity);
      });
    });
    describe('when adding an entity with the same name', () => {
      it('replaces the former one', () => {
        const object = new JDLObject();
        const entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: []
        });
        object.addEntity(entity);
        const entity2 = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid2',
          fields: []
        });
        object.addEntity(entity2);
        expect(object.entities[entity.name]).to.deep.eq(entity2);
      });
    });
  });
  describe('#addEnum', () => {
    describe('when adding an invalid enum', () => {
      it('fails', () => {
        const object = new JDLObject();
        try {
          object.addEnum(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The enum must be valid in order to be added.\nErrors: No enumeration');
        }
        try {
          object.addEnum({ values: ['A', 'B'] });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The enum must be valid in order to be added.\nErrors: No enumeration name');
        }
      });
    });
    describe('when adding a valid enum', () => {
      it('works', () => {
        const object = new JDLObject();
        const enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject);
      });
    });
    describe('when adding an enum with the same name', () => {
      it('replaces the old one', () => {
        const object = new JDLObject();
        const enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
        const enumObject2 = new JDLEnum({ name: 'Valid', values: ['A', 'B'] });
        object.addEnum(enumObject2);
        expect(object.enums[enumObject.name]).to.deep.eq(enumObject2);
      });
    });
  });
  describe('#addRelationship', () => {
    describe('when adding an invalid relationship', () => {
      it('fails', () => {
        const object = new JDLObject();
        try {
          object.addRelationship(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The relationship must be valid in order to be added.\nErrors: No relationship');
        }
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
    describe('when adding a valid relationship', () => {
      it('works', () => {
        const object = new JDLObject();
        const relationship = new JDLRelationship({
          from: { name: 'Valid2', tableName: 't_valid2', fields: [] },
          to: { name: 'Valid', tableName: 't_valid', fields: [] },
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
        expect(object.relationships.relationships.ManyToMany[relationship.getId()]).to.deep.eq(relationship);
      });
    });
    describe('when adding twice the same relationship', () => {
      it('doesn\'t do anything', () => {
        const object = new JDLObject();
        const relationship = new JDLRelationship({
          from: { name: 'Valid2', tableName: 't_valid2', fields: [] },
          to: { name: 'Valid', tableName: 't_valid', fields: [] },
          type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.MANY_TO_MANY,
          injectedFieldInFrom: 'something'
        });
        object.addRelationship(relationship);
        object.addRelationship(relationship);
        expect(Object.keys(object.relationships.relationships.ManyToMany).length).to.eq(1);
      });
    });
  });
  describe('#addOption', () => {
    describe('when adding an invalid option', () => {
      it('fails', () => {
        const object = new JDLObject();
        try {
          object.addOption(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The option must be valid in order to be added.\nErrors: No option');
        }
        try {
          object.addOption({});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq('The option must be valid in order to be added.\nErrors: No option name, No entity names, No excluded names, No type');
        }
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
    describe('when adding a valid option', () => {
      it('works', () => {
        const object = new JDLObject();
        const emptyOption = new JDLUnaryOption({ name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT });
        object.addOption(emptyOption);
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the JDL object', () => {
      const object = new JDLObject();
      const application = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
      object.addApplication(application);
      const entityA = new JDLEntity({ name: 'EntityA', tableName: 't_entity_a' });
      const field = new JDLField({ name: 'myField', type: 'String' });
      field.addValidation(new JDLValidation());
      entityA.addField(field);
      object.addEntity(entityA);
      const entityB = new JDLEntity({ name: 'EntityB', tableName: 't_entity_b' });
      object.addEntity(entityB);
      const enumObject = new JDLEnum({ name: 'MyEnum', values: ['A', 'B'] });
      object.addEnum(enumObject);
      const relationship = new JDLRelationship({
        from: entityA,
        to: entityB,
        type: RELATIONSHIP_TYPES.RELATIONSHIP_TYPES.ONE_TO_ONE,
        injectedFieldInFrom: 'entityB',
        injectedFieldInTo: 'entityA(myField)'
      });
      object.addRelationship(relationship);
      const option = new JDLUnaryOption({ name: UNARY_OPTIONS.UNARY_OPTIONS.SKIP_CLIENT });
      option.excludeEntity(entityA);
      object.addOption(option);
      const option2 = new JDLBinaryOption({
        name: BINARY_OPTIONS.BINARY_OPTIONS.DTO,
        value: BINARY_OPTIONS.BINARY_OPTION_VALUES.dto.MAPSTRUCT
      });
      option2.addEntity(entityB);
      object.addOption(option2);
      expect(object.toString()).to.eq(
        `${application.toString()}

${entityA.toString()}
${entityB.toString()}
${enumObject.toString()}

${relationship.toString()}

${option.toString()}
${option2.toString()}
`);
    });
  });
});

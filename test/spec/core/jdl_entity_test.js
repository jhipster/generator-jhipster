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
const { expect } = require('chai');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');

describe('JDLEntity', () => {
  describe('::new', () => {
    context('when not passing any argument', () => {
      it('fails', () => {
        expect(() => {
          new JDLEntity();
        }).to.throw('The entity name is mandatory to create an entity.');
      });
    });
    context('when not passing the name', () => {
      it('fails', () => {
        expect(() => {
          new JDLEntity({ name: null, comment: 'My entity' });
        }).to.throw('The entity name is mandatory to create an entity.');
      });
    });
    context('when not passing the table name', () => {
      let entity = null;

      before(() => {
        entity = new JDLEntity({ name: 'Abc' });
      });

      it('uses the names as value', () => {
        expect(entity.tableName).to.eq('Abc');
      });
    });
    context('when passing arguments', () => {
      let entity = null;
      let args = {};

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment',
          fields: [
            new JDLField({
              name: 'abc',
              type: 'String',
              comment: 'comment',
              validations: [new JDLValidation()]
            })
          ]
        };
        entity = new JDLEntity(args);
      });

      it('creates a new instance', () => {
        expect(entity.name).to.eq(args.name);
        expect(entity.tableName).to.eq(args.tableName);
        expect(entity.comment).to.eq(args.comment);
        expect(entity.fields).to.deep.eq(args.fields);
      });
    });
  });
  describe('::isValid', () => {
    context('when checking the validity of an invalid object', () => {
      context('because it is nil or invalid', () => {
        it('returns false', () => {
          expect(JDLEntity.isValid(null)).to.be.false;
          expect(JDLEntity.isValid(undefined)).to.be.false;
        });
      });
      context('without a name attribute', () => {
        it('returns false', () => {
          expect(JDLEntity.isValid({ tableName: 'Something', fields: [] })).to.be.false;
        });
      });
      context('with a reserved keyword as name', () => {
        it('returns false', () => {
          expect(JDLEntity.isValid({ name: 'class' })).to.be.false;
        });
      });
      context('without a table name', () => {
        it('returns false', () => {
          expect(JDLEntity.isValid({ name: 'Something', fields: [] })).to.be.false;
        });
      });
      context('because its fields are invalid', () => {
        it('returns false', () => {
          expect(
            JDLEntity.isValid({
              name: 'Something',
              tableName: 't_something',
              fields: [
                {
                  type: 'String',
                  comment: 'comment',
                  validations: []
                }
              ]
            })
          ).to.be.false;
        });
      });
    });
    context('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(JDLEntity.isValid({ name: 'Valid', tableName: 't_valid', fields: [] })).to.be.true;
      });
    });
  });
  describe('#addField', () => {
    let entity = null;

    before(() => {
      entity = new JDLEntity({
        name: 'Abc',
        tableName: 'String'
      });
    });

    context('when adding an invalid field', () => {
      it('fails', () => {
        expect(() => {
          entity.addField(null);
        }).to.throw(`The passed field '' must be valid to be added in entity '${entity.name}'.\nErrors: No field`);
        expect(() => {
          entity.addField({ name: 'myField' });
        }).to.throw(
          `The passed field 'myField' must be valid to be added in entity '${entity.name}'.\nErrors: No field type`
        );
      });
    });
    context('when adding a valid field', () => {
      let validField = null;

      before(() => {
        validField = new JDLField({ name: 'myField', type: 'String' });
      });

      it('works', () => {
        entity.addField(validField);
        expect(entity.fields).to.deep.eq({ myField: validField });
      });
    });
  });
  describe('#toString', () => {
    context('without a comment', () => {
      let entity = null;
      let args = null;

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String'
        };
        entity = new JDLEntity(args);
      });

      it('stringifies its content', () => {
        expect(entity.toString()).to.eq(`entity ${args.name} (${args.tableName})`);
      });
    });
    context('with a table equal to the name (snakecase)', () => {
      let entity = null;
      let args = null;

      before(() => {
        args = {
          name: 'MySuperEntity',
          tableName: 'my_super_entity'
        };
        entity = new JDLEntity(args);
      });

      it('does not export it', () => {
        expect(entity.toString()).to.equal(`entity ${args.name}`);
      });
    });
    context('with a table name not equal to the name (snakecase)', () => {
      let entity = null;
      let args = null;

      before(() => {
        args = {
          name: 'MySuperEntity',
          tableName: 'MyTableName'
        };
        entity = new JDLEntity(args);
      });

      it('exports it', () => {
        expect(entity.toString()).to.equal(`entity ${args.name} (MyTableName)`);
      });
    });
    context('without fields', () => {
      let entity = null;
      let args = null;

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment'
        };
        entity = new JDLEntity(args);
      });

      it('stringifies its content', () => {
        expect(entity.toString()).to.eq(
          `/**
 * ${args.comment}
 */
entity ${args.name} (${args.tableName})`
        );
      });
    });
    context('with fields', () => {
      let entity = null;
      let field1 = null;
      let field2 = null;

      before(() => {
        entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String',
          comment: 'Entity comment'
        });
        field1 = new JDLField({
          name: 'myField',
          type: 'Integer',
          comment: 'Field comment',
          validations: [new JDLValidation()]
        });
        field2 = new JDLField({
          name: 'myOtherField',
          type: 'Long'
        });
      });

      it('stringifies its content', () => {
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

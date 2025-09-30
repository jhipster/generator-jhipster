/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it } from 'esmocha';

import { expect } from 'chai';

import { JDLEntity } from './index.ts';
import JDLField from './jdl-field.ts';
import JDLValidation from './jdl-validation.ts';

describe('jdl - JDLEntity', () => {
  describe('new', () => {
    describe('when not passing any argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JDLEntity();
        }).to.throw('The entity name is mandatory to create an entity.');
      });
    });
    describe('when not passing the name', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JDLEntity({ name: null, comment: 'My entity' });
        }).to.throw('The entity name is mandatory to create an entity.');
      });
    });
    describe('when not passing the table name', () => {
      let entity: JDLEntity;

      before(() => {
        entity = new JDLEntity({ name: 'Abc' });
      });

      it('should not use any value', () => {
        expect(entity.tableName).to.equal(undefined);
      });
    });
    describe('when passing arguments', () => {
      let entity: JDLEntity;
      let args: any = {};

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
              // @ts-expect-error
              validations: [new JDLValidation()],
            }),
          ],
        };
        entity = new JDLEntity(args);
      });

      it('should create a new instance', () => {
        expect(entity.name).to.equal(args.name);
        expect(entity.tableName).to.equal(args.tableName);
        expect(entity.comment).to.equal(args.comment);
        expect(entity.fields).to.deep.eq(args.fields);
      });
    });
  });
  describe('addField', () => {
    let entity: JDLEntity;

    before(() => {
      entity = new JDLEntity({
        name: 'Abc',
        tableName: 'String',
      });
    });

    describe('when adding an invalid field', () => {
      describe('because it is nil', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error invalid api test
            entity.addField(null);
          }).to.throw(/^Can't add nil field to the JDL entity\.$/);
        });
      });
    });
    describe('when adding a valid field', () => {
      let validField: JDLField;

      before(() => {
        validField = new JDLField({ name: 'myField', type: 'String' });
      });

      it('should work', () => {
        entity.addField(validField);
        expect(entity.fields).to.deep.eq({ myField: validField });
      });
    });
  });
  describe('addFields', () => {
    describe('when not passing fields', () => {
      let entity: JDLEntity;

      before(() => {
        entity = new JDLEntity({
          name: 'Toto',
        });
        entity.addFields();
      });

      it('should not alter the entity', () => {
        expect(entity.toString()).to.equal('entity Toto');
      });
    });
    describe('when passing fields', () => {
      let entity: JDLEntity;

      before(() => {
        entity = new JDLEntity({
          name: 'Toto',
        });
        entity.addFields([
          new JDLField({
            name: 'tata',
            type: 'String',
          }),
          new JDLField({
            name: 'titi',
            type: 'Integer',
          }),
        ]);
      });

      it('should alter the entity', () => {
        expect(entity.toString()).to.equal(`entity Toto {
  tata String
  titi Integer
}`);
      });
    });
  });
  describe('forEachField', () => {
    describe('when not passing a function', () => {
      let entity: JDLEntity;

      before(() => {
        entity = new JDLEntity({
          name: 'Toto',
        });
      });

      it('should fail', () => {
        // @ts-expect-error FIXME
        expect(() => entity.forEachField()).to.throw();
      });
    });
    describe('when passing a function', () => {
      let result: string;

      before(() => {
        const entity = new JDLEntity({
          name: 'Toto',
        });
        entity.addField(
          new JDLField({
            name: 'a',
            type: 'String',
          }),
        );
        entity.addField(
          new JDLField({
            name: 'b',
            type: 'String',
          }),
        );
        result = '';
        entity.forEachField(field => {
          result += `${field.name}`;
        });
      });

      it('should iterate over the fields', () => {
        expect(result).to.equal('ab');
      });
    });
  });
  describe('toString', () => {
    describe('without a comment', () => {
      let entity: JDLEntity;
      let args: Record<string, any>;

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String',
        };
        entity = new JDLEntity(args);
      });

      it('should stringify its content', () => {
        expect(entity.toString()).to.equal(`entity ${args.name} (${args.tableName})`);
      });
    });
    describe('with a table name not equal to the name (snakecase)', () => {
      let entity: JDLEntity;
      let args: Record<string, any>;

      before(() => {
        args = {
          name: 'MySuperEntity',
          tableName: 'MyTableName',
        };
        entity = new JDLEntity(args);
      });

      it('should export it', () => {
        expect(entity.toString()).to.equal(`entity ${args.name} (MyTableName)`);
      });
    });
    describe('without fields', () => {
      let entity: JDLEntity;
      let args: Record<string, any>;

      before(() => {
        args = {
          name: 'Abc',
          tableName: 'String',
          comment: 'comment',
        };
        entity = new JDLEntity(args);
      });

      it('should stringify its content', () => {
        expect(entity.toString()).to.equal(
          `/**
 * ${args.comment}
 */
entity ${args.name} (${args.tableName})`,
        );
      });
    });
    describe('with fields', () => {
      let entity: JDLEntity;
      let field1: JDLField;
      let field2: JDLField;

      before(() => {
        entity = new JDLEntity({
          name: 'Abc',
          tableName: 'String',
          comment: 'Entity comment',
        });
        field1 = new JDLField({
          name: 'myField',
          type: 'Integer',
          comment: 'Field comment',
          // @ts-expect-error
          validations: [new JDLValidation()],
        });
        field2 = new JDLField({
          name: 'myOtherField',
          type: 'Long',
        });
      });

      it('should stringify its content', () => {
        entity.addField(field1);
        entity.addField(field2);
        expect(entity.toString()).to.equal(
          `/**
 * ${entity.comment}
 */
entity ${entity.name} (${entity.tableName}) {
  /**
   * ${field1.comment}
   */
  ${field1.name} ${field1.type} ${field1.validations[0]}
  ${field2.name} ${field2.type}
}`,
        );
      });
    });
  });
});

/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import JDLObject from '../../../../jdl/models/jdl-object.js';
import { JDLEntity, JDLEnum } from '../../../../jdl/models/index.mjs';
import JDLField from '../../../../jdl/models/jdl-field.js';
import JDLValidation from '../../../../jdl/models/jdl-validation.js';
import { fieldTypes, validations } from '../../../../jdl/jhipster/index.mjs';
import { convert } from '../../../../jdl/converters/jdl-to-json/jdl-to-json-field-converter.js';

const { CommonDBTypes } = fieldTypes;

const {
  Validations: { MINBYTES, PATTERN, MAXLENGTH, UNIQUE, REQUIRED, MAXBYTES, MINLENGTH, MIN, MAX },
} = validations;

describe('jdl - JDLToJSONFieldConverter', () => {
  describe('convert', () => {
    context('when not passing a JDL object', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convert()).to.throw(/^A JDL Object must be passed to convert JDL fields to JSON\.$/);
      });
    });
    context('when passing a JDL object', () => {
      context('without validation, comment or option', () => {
        let convertedField;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const firstFieldForA = new JDLField({
            name: 'firstField',
            type: CommonDBTypes.STRING,
          });
          entityA.addField(firstFieldForA);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedField = returnedMap.get('A')[0];
        });

        it('should convert them', () => {
          jestExpect(convertedField).toMatchInlineSnapshot(`
{
  "fieldName": "firstField",
  "fieldType": "String",
}
`);
        });
      });
      context('when having blobs', () => {
        context('that are recognised', () => {
          let convertedFields;

          before(() => {
            const jdlObject = new JDLObject();
            const entityA = new JDLEntity({
              name: 'A',
              tableName: 'entity_a',
              comment: 'The best entity',
            });
            const anyBlobField = new JDLField({
              name: 'anyBlobField',
              type: CommonDBTypes.ANY_BLOB,
            });
            const textBlobField = new JDLField({
              name: 'textBlobField',
              type: CommonDBTypes.TEXT_BLOB,
            });
            const blobField = new JDLField({
              name: 'blobField',
              type: CommonDBTypes.BLOB,
            });
            const imageBlobField = new JDLField({
              name: 'imageBlobField',
              type: CommonDBTypes.IMAGE_BLOB,
            });
            entityA.addField(anyBlobField);
            entityA.addField(textBlobField);
            entityA.addField(blobField);
            entityA.addField(imageBlobField);
            jdlObject.addEntity(entityA);
            const returnedMap: any = convert(jdlObject);
            convertedFields = returnedMap.get('A');
          });

          it('should convert them', () => {
            jestExpect(convertedFields).toMatchInlineSnapshot(`
[
  {
    "fieldName": "anyBlobField",
    "fieldType": "byte[]",
    "fieldTypeBlobContent": "any",
  },
  {
    "fieldName": "textBlobField",
    "fieldType": "byte[]",
    "fieldTypeBlobContent": "text",
  },
  {
    "fieldName": "blobField",
    "fieldType": "byte[]",
    "fieldTypeBlobContent": "any",
  },
  {
    "fieldName": "imageBlobField",
    "fieldType": "byte[]",
    "fieldTypeBlobContent": "image",
  },
]
`);
          });

          it('should convert the blob content', () => {});
        });
      });
      context('with field types being enums', () => {
        let convertedField;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            comment: 'The best entity',
          });
          const enumType = new JDLEnum({ name: 'CustomEnum', values: ['AA', 'AB'].map(value => ({ key: value })) });
          const enumField = new JDLField({
            name: 'enumField',
            type: 'CustomEnum',
          });
          jdlObject.addEnum(enumType);
          entityA.addField(enumField);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedField = returnedMap.get('A')[0];
        });

        it('should convert them', () => {
          jestExpect(convertedField).toMatchInlineSnapshot(`
{
  "fieldName": "enumField",
  "fieldType": "CustomEnum",
  "fieldValues": "AA,AB",
}
`);
        });
      });
      context('with field types being enums with comments', () => {
        let convertedField;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            comment: 'The best entity',
          });
          const enumType = new JDLEnum({
            comment: 'enum comment',
            name: 'CustomEnum',
            values: ['AA', 'AB'].map(value => ({ key: value, comment: 'some comment' })),
          });
          const enumField = new JDLField({
            name: 'enumField',
            type: 'CustomEnum',
          });
          jdlObject.addEnum(enumType);
          entityA.addField(enumField);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedField = returnedMap.get('A')[0];
        });

        it('should convert them', () => {
          jestExpect(convertedField).toMatchInlineSnapshot(`
{
  "fieldName": "enumField",
  "fieldType": "CustomEnum",
  "fieldTypeJavadoc": "enum comment",
  "fieldValues": "AA,AB",
  "fieldValuesJavadocs": {
    "AA": "some comment",
    "AB": "some comment",
  },
}
`);
        });
      });
      context('with comments', () => {
        let convertedField;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const firstFieldForA = new JDLField({
            name: 'firstField',
            type: CommonDBTypes.STRING,
            comment: 'The best field',
          });
          entityA.addField(firstFieldForA);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedField = returnedMap.get('A')[0];
        });

        it('should convert them', () => {
          jestExpect(convertedField).toMatchInlineSnapshot(`
{
  "fieldName": "firstField",
  "fieldType": "String",
  "javadoc": "The best field",
}
`);
        });
      });
      context('with validations', () => {
        let convertedFields;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const stringField = new JDLField({
            name: 'stringField',
            type: CommonDBTypes.STRING,
          });
          const integerField = new JDLField({
            name: 'integerField',
            type: CommonDBTypes.INTEGER,
          });
          const blobField = new JDLField({
            name: 'blobField',
            type: CommonDBTypes.ANY_BLOB,
          });
          const requiredValidation = new JDLValidation({
            name: REQUIRED,
            value: true,
          });
          const uniqueValidation = new JDLValidation({
            name: UNIQUE,
            value: true,
          });
          const minValidation = new JDLValidation({
            name: MIN,
            value: 0,
          });
          const maxValidation = new JDLValidation({
            name: MAX,
            value: 10,
          });
          const minLengthValidation = new JDLValidation({
            name: MINLENGTH,
            value: 0,
          });
          const maxLengthValidation = new JDLValidation({
            name: MAXLENGTH,
            value: 10,
          });
          const patternValidation = new JDLValidation({
            name: PATTERN,
            // eslint-disable-next-line prettier/prettier,no-useless-escape
            value: '^d$',
          });
          const minBytesValidation = new JDLValidation({
            name: MINBYTES,
            value: 0,
          });
          const maxBytesValidation = new JDLValidation({
            name: MAXBYTES,
            value: 10,
          });
          stringField.addValidation(requiredValidation);
          stringField.addValidation(uniqueValidation);
          stringField.addValidation(minLengthValidation);
          stringField.addValidation(maxLengthValidation);
          stringField.addValidation(patternValidation);
          integerField.addValidation(minValidation);
          integerField.addValidation(maxValidation);
          blobField.addValidation(minBytesValidation);
          blobField.addValidation(maxBytesValidation);
          entityA.addField(stringField);
          entityA.addField(integerField);
          entityA.addField(blobField);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedFields = returnedMap.get('A');
        });

        it('should convert them', () => {
          jestExpect(convertedFields).toMatchInlineSnapshot(`
[
  {
    "fieldName": "stringField",
    "fieldType": "String",
    "fieldValidateRules": [
      "required",
      "unique",
      "minlength",
      "maxlength",
      "pattern",
    ],
    "fieldValidateRulesMaxlength": 10,
    "fieldValidateRulesMinlength": 0,
    "fieldValidateRulesPattern": "^d$",
  },
  {
    "fieldName": "integerField",
    "fieldType": "Integer",
    "fieldValidateRules": [
      "min",
      "max",
    ],
    "fieldValidateRulesMax": 10,
    "fieldValidateRulesMin": 0,
  },
  {
    "fieldName": "blobField",
    "fieldType": "byte[]",
    "fieldTypeBlobContent": "any",
    "fieldValidateRules": [
      "minbytes",
      "maxbytes",
    ],
    "fieldValidateRulesMaxbytes": 10,
    "fieldValidateRulesMinbytes": 0,
  },
]
`);
        });
      });
      context('with options', () => {
        let convertedField;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const firstFieldForA = new JDLField({
            name: 'firstField',
            type: CommonDBTypes.STRING,
            comment: 'The best field',
            options: {
              id: 42,
            },
          });
          entityA.addField(firstFieldForA);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert(jdlObject);
          convertedField = returnedMap.get('A')[0];
        });

        it('should convert them', () => {
          jestExpect(convertedField).toMatchInlineSnapshot(`
{
  "fieldName": "firstField",
  "fieldType": "String",
  "javadoc": "The best field",
  "options": {
    "id": 42,
  },
}
`);
        });
      });
    });
  });
});

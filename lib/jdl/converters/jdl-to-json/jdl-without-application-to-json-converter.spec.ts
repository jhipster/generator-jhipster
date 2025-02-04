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

import { after, before, describe, it, expect as jestExpect } from 'esmocha';
import { use as chaiUse, expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chaiUse(sinonChai);

import { relationshipTypes } from '../../core/basic-types/index.js';

import {
  applicationTypes,
  binaryOptions,
  databaseTypes,
  fieldTypes,
  relationshipOptions,
  unaryOptions,
  validations,
} from '../../core/built-in-options/index.js';

import JDLObject from '../../core/models/jdl-object.js';
import { JDLEntity, JDLEnum } from '../../core/models/index.js';
import JDLField from '../../core/models/jdl-field.js';
import JDLValidation from '../../core/models/jdl-validation.js';
import JDLRelationship from '../../core/models/jdl-relationship.js';
import JDLUnaryOption from '../../core/models/jdl-unary-option.js';
import JDLBinaryOption from '../../core/models/jdl-binary-option.js';
import logger from '../../core/utils/objects/logger.js';
import { convert } from './jdl-without-application-to-json-converter.js';

const {
  Validations: { REQUIRED, UNIQUE, MIN, MAX, MINLENGTH, MAXLENGTH, PATTERN, MINBYTES, MAXBYTES },
} = validations;
const { MONOLITH } = applicationTypes;
const { CommonDBTypes } = fieldTypes;
const { SQL } = databaseTypes;

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;
const { BUILT_IN_ENTITY } = relationshipOptions;

describe('jdl - JDLWithoutApplicationToJSONConverter', () => {
  describe('convert', () => {
    describe('when passing invalid parameters', () => {
      describe('such as no parameter', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-expect-error
            convert();
          }).to.throw(/^The JDL object, the application's name, and its the database type are mandatory\.$/);
        });
      });
      describe('such as an no database type', () => {
        it('should throw an error', () => {
          expect(() => {
            convert({ jdlObject: new JDLObject(), applicationName: 'toto' });
          }).to.throw(/^The JDL object, the application's name, and its the database type are mandatory\.$/);
        });
      });
      describe('such as no application name', () => {
        it('should throw an error', () => {
          expect(() => {
            convert({ jdlObject: new JDLObject(), databaseType: 'sql' });
          }).to.throw(/^The JDL object, the application's name, and its the database type are mandatory\.$/);
        });
      });
    });
    describe('when passing a JDL object without entities', () => {
      let result;

      before(() => {
        const jdlObject = new JDLObject();
        result = convert({
          jdlObject,
          applicationName: 'toto',
          applicationType: MONOLITH,
          databaseType: SQL,
        });
      });

      it('should return a list with no entity', () => {
        expect(result.get('toto').length).to.equal(0);
      });
    });
    describe('when passing a JDL object with entities', () => {
      describe('with some of them being built-in entities', () => {
        let builtInEntitiesAreConverted;
        let customEntitiesAreConverted;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const userEntity = new JDLEntity({
            name: 'User',
          });
          const authorityEntity = new JDLEntity({
            name: 'Authority',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(userEntity);
          jdlObject.addEntity(authorityEntity);
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          customEntitiesAreConverted = returnedMap.get('toto').some(entity => entity.name === 'A');
          builtInEntitiesAreConverted = returnedMap.get('toto').some(entity => entity.name === 'User' || entity.name === 'Authority');
        });

        it('should convert built-in entities', () => {
          expect(builtInEntitiesAreConverted).to.be.true;
        });
        it('should convert custom entities', () => {
          expect(customEntitiesAreConverted).to.be.true;
        });
      });
      describe('with no field, no option and no relationship', () => {
        let convertedEntity;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        it('should convert the entity', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
        });
      });
      describe('with options', () => {
        let convertedEntity;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const options = [
            new JDLUnaryOption({
              name: unaryOptions.EMBEDDED,
              entityNames: new Set(['A']),
            }),
            new JDLUnaryOption({
              name: unaryOptions.NO_FLUENT_METHOD,
              entityNames: new Set(['A']),
            }),
            new JDLUnaryOption({
              name: unaryOptions.FILTER,
              entityNames: new Set(['A']),
            }),
            new JDLUnaryOption({
              name: unaryOptions.READ_ONLY,
              entityNames: new Set(['A']),
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_CLIENT,
              entityNames: new Set(['A']),
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_SERVER,
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.ANGULAR_SUFFIX,
              value: 'suffix',
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.CLIENT_ROOT_FOLDER,
              value: '../core/client_root_folder',
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.MICROSERVICE,
              value: 'myMs',
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.PAGINATION,
              value: binaryOptions.Values.pagination.PAGINATION,
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SEARCH,
              value: binaryOptions.Values.search.COUCHBASE,
              entityNames: new Set(['A']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SERVICE,
              value: binaryOptions.Values.service.SERVICE_IMPL,
              entityNames: new Set(['A']),
            }),
          ];
          jdlObject.addEntity(entityA);
          options.forEach(option => jdlObject.addOption(option));
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        it('should convert the entity', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "angularJSSuffix": "suffix",
  "annotations": {},
  "applications": "*",
  "clientRootFolder": "../core/client_root_folder",
  "documentation": "The best entity",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": false,
  "jpaMetamodelFiltering": true,
  "microserviceName": "myMs",
  "name": "A",
  "pagination": "pagination",
  "readOnly": true,
  "relationships": [],
  "searchEngine": "couchbase",
  "service": "serviceImpl",
  "skipClient": true,
  "skipServer": true,
}
`);
        });
      });
      describe('when setting the DTO option without the service option', () => {
        let convertedEntity;
        let loggerSpy;

        before(() => {
          loggerSpy = sinon.spy(logger, 'info');
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: new Set(['A']),
            }),
          );
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        after(() => {
          loggerSpy.restore();
        });

        it('should log the automatic setting of the option', () => {
          expect(loggerSpy.getCall(0).args[0]).to.equal(
            "The dto option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this entity if " +
              'no other value has been set.',
          );
        });
        it('should set the service option to serviceClass', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": "mapstruct",
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": "serviceClass",
}
`);
        });
      });
      describe('when setting the filtering option without the service option', () => {
        let convertedEntity;
        let loggerSpy;

        before(() => {
          loggerSpy = sinon.spy(logger, 'info');
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLUnaryOption({
              name: unaryOptions.FILTER,
              entityNames: new Set(['A']),
            }),
          );
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        after(() => {
          loggerSpy.restore();
        });

        it('should log the automatic setting of the option', () => {
          expect(loggerSpy.getCall(0).args[0]).to.equal(
            "The filter option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this " +
              'entity if no other value has been set.',
          );
        });
        it('should set the service option to serviceClass', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": true,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": "serviceClass",
}
`);
        });
      });
      describe('when the searching option is set with exclusions', () => {
        let convertedEntity;

        before(() => {
          const jdlObject = new JDLObject();
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          jdlObject.addOption(
            new JDLBinaryOption({
              name: binaryOptions.Options.SEARCH,
              value: binaryOptions.Values.search.COUCHBASE,
              entityNames: new Set(['*']),
              excludedNames: new Set(['A']),
            }),
          );
          const returnedMap: any = convert({
            jdlObject,
            applicationName: 'toto',
            applicationType: MONOLITH,
            databaseType: SQL,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        it('should prevent the entities from being searched', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "searchEngine": "no",
  "service": undefined,
}
`);
        });
      });
      describe('with fields', () => {
        describe('without validation, comment or option', () => {
          let convertedEntity;

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
            const secondFieldForA = new JDLField({
              name: 'secondField',
              type: CommonDBTypes.INTEGER,
            });
            entityA.addField(firstFieldForA);
            entityA.addField(secondFieldForA);
            jdlObject.addEntity(entityA);
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [
    {
      "fieldName": "firstField",
      "fieldType": "String",
    },
    {
      "fieldName": "secondField",
      "fieldType": "Integer",
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
        describe('when having blobs', () => {
          let convertedEntity;

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
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [
    {
      "fieldName": "anyBlobField",
      "fieldType": "AnyBlob",
    },
    {
      "fieldName": "textBlobField",
      "fieldType": "TextBlob",
    },
    {
      "fieldName": "blobField",
      "fieldType": "Blob",
    },
    {
      "fieldName": "imageBlobField",
      "fieldType": "ImageBlob",
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
        describe('with field types being enums', () => {
          let convertedEntity;

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
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": undefined,
  "fields": [
    {
      "fieldName": "enumField",
      "fieldType": "CustomEnum",
      "fieldValues": "AA,AB",
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
        describe('with comments', () => {
          let convertedEntity;

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
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [
    {
      "documentation": "The best field",
      "fieldName": "firstField",
      "fieldType": "String",
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
        describe('with validations', () => {
          let convertedEntity;

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
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [
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
      "fieldType": "AnyBlob",
      "fieldValidateRules": [
        "minbytes",
        "maxbytes",
      ],
      "fieldValidateRulesMaxbytes": 10,
      "fieldValidateRulesMinbytes": 0,
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
        describe('with options', () => {
          let convertedEntity;

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
            const returnedMap: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            convertedEntity = returnedMap.get('toto')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "annotations": {},
  "applications": "*",
  "documentation": "The best entity",
  "dto": undefined,
  "embedded": undefined,
  "entityTableName": "entity_a",
  "fields": [
    {
      "documentation": "The best field",
      "fieldName": "firstField",
      "fieldType": "String",
      "options": {
        "id": 42,
      },
    },
  ],
  "fluentMethods": undefined,
  "jpaMetamodelFiltering": undefined,
  "name": "A",
  "pagination": undefined,
  "readOnly": undefined,
  "relationships": [],
  "service": undefined,
}
`);
          });
        });
      });
      describe('with relationships', () => {
        describe('without options, required relationships or comments', () => {
          let relationshipsForA;
          let relationshipsForB;

          before(() => {
            const jdlObject = new JDLObject();
            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
            });
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
            });
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
            });
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
            });
            jdlObject.addEntity(entityA);
            jdlObject.addEntity(entityB);
            jdlObject.addRelationship(oneToOneRelationship);
            jdlObject.addRelationship(manyToManyRelationship);
            jdlObject.addRelationship(oneToManyRelationship);
            jdlObject.addRelationship(manyToOneRelationship);
            const returned: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
            relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
          });

          it('should convert them', () => {
            jestExpect(relationshipsForA).toMatchInlineSnapshot(`
              [
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                },
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-many",
                },
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-one",
                },
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-many",
                },
              ]
            `);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
              [
                {
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-one",
                },
                {
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "many-to-one",
                },
                {
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-many",
                },
                {
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "many-to-many",
                },
              ]
            `);
          });
        });
        describe('with options', () => {
          describe('being custom options', () => {
            let convertedRelationship;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_ONE,
                injectedFieldInTo: 'a',
                injectedFieldInFrom: 'b',
                options: {
                  global: {
                    custom: 42,
                  },
                  source: {},
                  destination: {},
                },
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              convertedRelationship = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
            });

            it('should convert them', () => {
              jestExpect(convertedRelationship).toMatchInlineSnapshot(`
                {
                  "options": {
                    "custom": 42,
                  },
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                }
              `);
            });
          });
          describe('being regular options', () => {
            let convertedRelationship;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_ONE,
                injectedFieldInTo: 'a',
                injectedFieldInFrom: 'b',
                options: {
                  global: {
                    [BUILT_IN_ENTITY]: true,
                  },
                  source: {},
                  destination: {},
                },
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              convertedRelationship = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
            });

            it('should convert them', () => {
              jestExpect(convertedRelationship).toMatchInlineSnapshot(`
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                  "relationshipWithBuiltInEntity": true,
                }
              `);
            });
          });
        });
        describe('with required relationships', () => {
          let relationshipsForA;
          let relationshipsForB;

          before(() => {
            const jdlObject = new JDLObject();
            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              isInjectedFieldInFromRequired: true,
              isInjectedFieldInToRequired: true,
            });
            jdlObject.addEntity(entityA);
            jdlObject.addEntity(entityB);
            jdlObject.addRelationship(oneToOneRelationship);
            const returned: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
            relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
          });

          it('should convert them', () => {
            jestExpect(relationshipsForA).toMatchInlineSnapshot(`
              [
                {
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                  "relationshipValidateRules": "required",
                },
              ]
            `);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
              [
                {
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-one",
                  "relationshipValidateRules": "required",
                },
              ]
            `);
          });
        });
        describe('with comments', () => {
          let relationshipsForA;
          let relationshipsForB;

          before(() => {
            const jdlObject = new JDLObject();
            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              commentInFrom: 'A to B',
              commentInTo: 'A to B but in the destination',
            });
            jdlObject.addEntity(entityA);
            jdlObject.addEntity(entityB);
            jdlObject.addRelationship(oneToOneRelationship);
            const returned: any = convert({
              jdlObject,
              applicationName: 'toto',
              applicationType: MONOLITH,
              databaseType: SQL,
            });
            relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
            relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
          });

          it('should convert them', () => {
            jestExpect(relationshipsForA).toMatchInlineSnapshot(`
              [
                {
                  "documentation": "A to B",
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                },
              ]
            `);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
              [
                {
                  "documentation": "A to B but in the destination",
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-one",
                },
              ]
            `);
          });
        });
        describe("when the injected field in the destination side isn't present", () => {
          describe('for a One-to-One relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_ONE,
                injectedFieldInFrom: 'b',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add the relationship for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityName": "b",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                }
              `);
            });
            it('should not add the relationship for the destination entity', () => {
              expect(relationshipFromDestinationToSource).to.be.undefined;
            });
          });
          describe('for a One-to-Many relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToManyRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_MANY,
                injectedFieldInFrom: 'b',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToManyRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add the relationship for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityName": "b",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-many",
                }
              `);
            });
            it('should add the relationship for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toBeUndefined();
            });
          });
          describe('for a Many-to-One relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const manyToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: MANY_TO_ONE,
                injectedFieldInFrom: 'b',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(manyToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add the relationship for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityName": "b",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-one",
                }
              `);
            });
            it('should not add the relationship for the destination entity', () => {
              expect(relationshipFromDestinationToSource).to.be.undefined;
            });
          });
          describe('for a Many-to-Many relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const manyToManyRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: MANY_TO_MANY,
                injectedFieldInFrom: 'b',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(manyToManyRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add the relationship for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityName": "b",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-many",
                }
              `);
            });
            it('should add the relationship for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toBeUndefined();
            });
          });
        });
        describe('when setting custom field for relationship mapping', () => {
          describe('for a One-to-One relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_ONE,
                injectedFieldInFrom: 'b(name)',
                injectedFieldInTo: 'a(name)',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add it for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-one",
                }
              `);
            });
            it('should ignore it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-one",
                }
              `);
            });
          });
          describe('for a One-to-Many relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const oneToManyRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: ONE_TO_MANY,
                injectedFieldInFrom: 'b(name)',
                injectedFieldInTo: 'a(name)',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(oneToManyRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should ignore it for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "one-to-many",
                }
              `);
            });
            it('should add it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "many-to-one",
                }
              `);
            });
          });
          describe('for a Many-to-One relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const manyToOneRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: MANY_TO_ONE,
                injectedFieldInFrom: 'b(name)',
                injectedFieldInTo: 'a(name)',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(manyToOneRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add it for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-one",
                }
              `);
            });
            it('should ignore it for the source entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "one-to-many",
                }
              `);
            });
          });
          describe('for a Many-to-Many relationship', () => {
            let relationshipFromSourceToDestination;
            let relationshipFromDestinationToSource;

            before(() => {
              const jdlObject = new JDLObject();
              const entityA = new JDLEntity({ name: 'A', comment: 'a' });
              const entityB = new JDLEntity({ name: 'B', comment: 'b' });
              const manyToManyRelationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type: MANY_TO_MANY,
                injectedFieldInFrom: 'b(name)',
                injectedFieldInTo: 'a(name)',
              });
              jdlObject.addEntity(entityA);
              jdlObject.addEntity(entityB);
              jdlObject.addRelationship(manyToManyRelationship);
              const returned: any = convert({
                jdlObject,
                applicationName: 'toto',
                applicationType: MONOLITH,
                databaseType: SQL,
              });
              relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
              relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
            });

            it('should add it for the source entity', () => {
              jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "b",
                  "otherEntityRelationshipName": "a",
                  "relationshipName": "b",
                  "relationshipSide": "left",
                  "relationshipType": "many-to-many",
                }
              `);
            });
            it('should add it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
                {
                  "otherEntityField": "name",
                  "otherEntityName": "a",
                  "otherEntityRelationshipName": "b",
                  "relationshipName": "a",
                  "relationshipSide": "right",
                  "relationshipType": "many-to-many",
                }
              `);
            });
          });
        });
      });
    });
  });
});

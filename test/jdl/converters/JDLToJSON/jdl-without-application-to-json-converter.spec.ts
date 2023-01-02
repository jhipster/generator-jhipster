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

/* eslint-disable no-new, no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
import { expect } from 'chai';

import { convert } from '../../../../jdl/converters/jdl-to-json/jdl-without-application-to-json-converter.js';

import {
  applicationTypes,
  databaseTypes,
  fieldTypes,
  validations,
  unaryOptions,
  binaryOptions,
  relationshipTypes,
  relationshipOptions,
} from '../../../../jdl/jhipster/index.mjs';

import JDLObject from '../../../../jdl/models/jdl-object.js';
import { JDLEntity, JDLEnum } from '../../../../jdl/models/index.mjs';
import JDLField from '../../../../jdl/models/jdl-field.js';
import JDLValidation from '../../../../jdl/models/jdl-validation.js';
import JDLRelationship from '../../../../jdl/models/jdl-relationship.js';
import JDLUnaryOption from '../../../../jdl/models/jdl-unary-option.js';
import JDLBinaryOption from '../../../../jdl/models/jdl-binary-option.js';
import logger from '../../../../jdl/utils/objects/logger.js';

const {
  Validations: { REQUIRED, UNIQUE, MIN, MAX, MINLENGTH, MAXLENGTH, PATTERN, MINBYTES, MAXBYTES },
} = validations;
const { MONOLITH } = applicationTypes;
const { CommonDBTypes } = fieldTypes;
const { SQL } = databaseTypes;

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;
const { JPA_DERIVED_IDENTIFIER } = relationshipOptions;

describe('JDLWithoutApplicationToJSONConverter', () => {
  describe('convert', () => {
    context('when passing invalid parameters', () => {
      context('such as no parameter', () => {
        it('should throw an error', () => {
          expect(() => {
            convert();
          }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
        });
      });
      context('such as an no database type', () => {
        it('should throw an error', () => {
          expect(() => {
            convert({ jdlObject: new JDLObject(), applicationName: 'toto' });
          }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
        });
      });
      context('such as no application name', () => {
        it('should throw an error', () => {
          expect(() => {
            convert({ jdlObject: new JDLObject(), databaseType: 'sql' });
          }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
        });
      });
    });
    context('when passing a JDL object without entities', () => {
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
    context('when passing a JDL object with entities', () => {
      context('with some of them being built-in entities', () => {
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
          customEntitiesAreConverted = returnedMap.get('toto').every(entity => entity.name === 'A');
          builtInEntitiesAreConverted = returnedMap.get('toto').some(entity => entity.name === 'User' || entity.name === 'Authority');
        });

        it('should not convert built-in entities', () => {
          expect(builtInEntitiesAreConverted).to.be.false;
        });
        it('should convert custom entities', () => {
          expect(customEntitiesAreConverted).to.be.true;
        });
      });
      context('with no field, no option and no relationship', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
        });
      });
      context('with options', () => {
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
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.FILTER,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.READ_ONLY,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_CLIENT,
              entityNames: ['A'],
            }),
            new JDLUnaryOption({
              name: unaryOptions.SKIP_SERVER,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.ANGULAR_SUFFIX,
              value: 'suffix',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.CLIENT_ROOT_FOLDER,
              value: '../client_root_folder',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.MICROSERVICE,
              value: 'myMs',
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.PAGINATION,
              value: binaryOptions.Values.pagination.PAGINATION,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SEARCH,
              value: binaryOptions.Values.search.COUCHBASE,
              entityNames: ['A'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SERVICE,
              value: binaryOptions.Values.service.SERVICE_IMPL,
              entityNames: ['A'],
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
  "applications": "*",
  "clientRootFolder": "../client_root_folder",
  "dto": "mapstruct",
  "embedded": true,
  "entityTableName": "entity_a",
  "fields": Array [],
  "fluentMethods": false,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": true,
  "microserviceName": "myMs",
  "name": "A",
  "pagination": "pagination",
  "readOnly": true,
  "relationships": Array [],
  "searchEngine": "couchbase",
  "service": "serviceImpl",
  "skipClient": true,
  "skipServer": true,
}
`);
        });
      });
      context('when setting the DTO option without the service option', () => {
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
              entityNames: ['A'],
            })
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
              'no other value has been set.'
          );
        });
        it('should set the service option to serviceClass', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "applications": "*",
  "dto": "mapstruct",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "serviceClass",
}
`);
        });
      });
      context('when setting the filtering option without the service option', () => {
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
              entityNames: ['A'],
            })
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
              'entity if no other value has been set.'
          );
        });
        it('should set the service option to serviceClass', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": true,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "serviceClass",
}
`);
        });
      });
      context('when the searching option is set with exclusions', () => {
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
            new JDLUnaryOption({
              name: binaryOptions.Options.SEARCH,
              values: binaryOptions.Values.search.COUCHBASE,
              entityNames: ['*'],
              excludedNames: ['A'],
            })
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "searchEngine": false,
  "service": "no",
}
`);
        });
      });
      context('with fields', () => {
        context('without validation, comment or option', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [
    Object {
      "fieldName": "firstField",
      "fieldType": "String",
    },
    Object {
      "fieldName": "secondField",
      "fieldType": "Integer",
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
        context('when having blobs', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [
    Object {
      "fieldName": "anyBlobField",
      "fieldType": "byte[]",
      "fieldTypeBlobContent": "any",
    },
    Object {
      "fieldName": "textBlobField",
      "fieldType": "byte[]",
      "fieldTypeBlobContent": "text",
    },
    Object {
      "fieldName": "blobField",
      "fieldType": "byte[]",
      "fieldTypeBlobContent": "any",
    },
    Object {
      "fieldName": "imageBlobField",
      "fieldType": "byte[]",
      "fieldTypeBlobContent": "image",
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
        context('with field types being enums', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "a",
  "fields": Array [
    Object {
      "fieldName": "enumField",
      "fieldType": "CustomEnum",
      "fieldValues": "AA,AB",
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
        context('with comments', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [
    Object {
      "fieldName": "firstField",
      "fieldType": "String",
      "javadoc": "The best field",
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
        context('with validations', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [
    Object {
      "fieldName": "stringField",
      "fieldType": "String",
      "fieldValidateRules": Array [
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
    Object {
      "fieldName": "integerField",
      "fieldType": "Integer",
      "fieldValidateRules": Array [
        "min",
        "max",
      ],
      "fieldValidateRulesMax": 10,
      "fieldValidateRulesMin": 0,
    },
    Object {
      "fieldName": "blobField",
      "fieldType": "byte[]",
      "fieldTypeBlobContent": "any",
      "fieldValidateRules": Array [
        "minbytes",
        "maxbytes",
      ],
      "fieldValidateRulesMaxbytes": 10,
      "fieldValidateRulesMinbytes": 0,
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
        context('with options', () => {
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
  "applications": "*",
  "dto": "no",
  "embedded": false,
  "entityTableName": "entity_a",
  "fields": Array [
    Object {
      "fieldName": "firstField",
      "fieldType": "String",
      "javadoc": "The best field",
      "options": Object {
        "id": 42,
      },
    },
  ],
  "fluentMethods": true,
  "javadoc": "The best entity",
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "no",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
          });
        });
      });
      context('with relationships', () => {
        context('without options, required relationships or comments', () => {
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
Array [
  Object {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "one-to-one",
  },
  Object {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "relationshipName": "b",
    "relationshipType": "one-to-many",
  },
  Object {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "relationshipName": "b",
    "relationshipType": "many-to-one",
  },
  Object {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "many-to-many",
  },
]
`);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
Array [
  Object {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
  },
  Object {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "relationshipName": "a",
    "relationshipType": "many-to-one",
  },
  Object {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "relationshipName": "a",
    "relationshipType": "one-to-many",
  },
  Object {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "many-to-many",
  },
]
`);
          });
        });
        context('with options', () => {
          context('being custom options', () => {
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
Object {
  "options": Object {
    "custom": 42,
  },
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
            });
          });
          context('being regular options', () => {
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
                    [JPA_DERIVED_IDENTIFIER]: true,
                  },
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
Object {
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
  "useJPADerivedIdentifier": true,
}
`);
            });
          });
        });
        context('with required relationships', () => {
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
Array [
  Object {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "one-to-one",
    "relationshipValidateRules": "required",
  },
]
`);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
Array [
  Object {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
    "relationshipValidateRules": "required",
  },
]
`);
          });
        });
        context('with comments', () => {
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
Array [
  Object {
    "javadoc": "A to B",
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "one-to-one",
  },
]
`);
            jestExpect(relationshipsForB).toMatchInlineSnapshot(`
Array [
  Object {
    "javadoc": "A to B but in the destination",
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
  },
]
`);
          });
        });
        context("when the injected field in the destination side isn't present", () => {
          context('for a One-to-One relationship', () => {
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
Object {
  "otherEntityName": "b",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
            });
            it('should not add the relationship for the destination entity', () => {
              expect(relationshipFromDestinationToSource).to.be.undefined;
            });
          });
          context('for a One-to-Many relationship', () => {
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
Object {
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "one-to-many",
}
`);
            });
            it('should add the relationship for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "many-to-one",
}
`);
            });
          });
          context('for a Many-to-One relationship', () => {
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
Object {
  "otherEntityName": "b",
  "relationshipName": "b",
  "relationshipType": "many-to-one",
}
`);
            });
            it('should not add the relationship for the destination entity', () => {
              expect(relationshipFromDestinationToSource).to.be.undefined;
            });
          });
          context('for a Many-to-Many relationship', () => {
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
Object {
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "many-to-many",
}
`);
            });
            it('should add the relationship for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "many-to-many",
}
`);
            });
          });
        });
        context('when setting custom field for relationship mapping', () => {
          context('for a One-to-One relationship', () => {
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
Object {
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
            });
            it('should ignore it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityField": "name",
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "one-to-one",
}
`);
            });
          });
          context('for a One-to-Many relationship', () => {
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
Object {
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "one-to-many",
}
`);
            });
            it('should add it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityField": "name",
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "many-to-one",
}
`);
            });
          });
          context('for a Many-to-One relationship', () => {
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
Object {
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "many-to-one",
}
`);
            });
            it('should ignore it for the source entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityField": "name",
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "one-to-many",
}
`);
            });
          });
          context('for a Many-to-Many relationship', () => {
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
Object {
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "many-to-many",
}
`);
            });
            it('should add it for the destination entity', () => {
              jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
Object {
  "otherEntityField": "name",
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
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

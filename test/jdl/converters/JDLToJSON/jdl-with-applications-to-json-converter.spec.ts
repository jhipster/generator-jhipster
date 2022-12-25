/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import createJDLApplication from '../../../../jdl/models/jdl-application-factory.js';
import JDLObject from '../../../../jdl/models/jdl-object.js';
import { JDLEntity, JDLEnum } from '../../../../jdl/models/index.mjs';
import JDLField from '../../../../jdl/models/jdl-field.js';
import JDLValidation from '../../../../jdl/models/jdl-validation.js';
import JDLRelationship from '../../../../jdl/models/jdl-relationship.js';
import JDLUnaryOption from '../../../../jdl/models/jdl-unary-option.js';
import JDLBinaryOption from '../../../../jdl/models/jdl-binary-option.js';

import logger from '../../../../jdl/utils/objects/logger.js';
import { convert } from '../../../../jdl/converters/jdl-to-json/jdl-with-applications-to-json-converter.js';

const {
  Validations: { REQUIRED, UNIQUE, MIN, MAX, MINLENGTH, MAXLENGTH, PATTERN, MINBYTES, MAXBYTES },
} = validations;
const { MONOLITH } = applicationTypes;
const { CommonDBTypes } = fieldTypes;
const { SQL } = databaseTypes;

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;

const { JPA_DERIVED_IDENTIFIER } = relationshipOptions;

describe('JDLWithApplicationsToJSONConverter', () => {
  describe('convert', () => {
    context('when passing invalid parameters', () => {
      context('such as no JDL object', () => {
        it('should throw an error', () => {
          expect(() => {
            convert();
          }).to.throw(/^The JDL object is mandatory\.$/);
        });
      });
    });
    context('when passing a JDL object with two applications one with and one without entities', () => {
      let result;

      before(() => {
        const jdlObject = new JDLObject();
        const application1 = createJDLApplication({ applicationType: MONOLITH, baseName: 'app1' });
        jdlObject.addApplication(application1);
        const entity = new JDLEntity({
          name: 'EntityA',
        });
        const application2 = createJDLApplication({ applicationType: MONOLITH, baseName: 'app2' });
        application2.addEntityName('EntityA');
        jdlObject.addEntity(entity);
        jdlObject.addApplication(application2);
        result = convert({
          jdlObject,
        });
      });

      it('should return a map with two applications', () => {
        expect(result.size).to.equal(2);
        expect(result.get('app1').length).to.equal(0);
        expect(result.get('app2').length).to.equal(1);
      });
    });
    context('when passing a JDL object without entities', () => {
      let result;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
        jdlObject.addApplication(application);
        result = convert({
          jdlObject,
        });
      });

      it('should return a map with no entiy', () => {
        result.forEach(entities => {
          expect(entities.length).to.equal(0);
        });
      });
    });
    context('when passing a JDL object with entities', () => {
      context('with some of them being built-in entities', () => {
        let builtInEntitiesAreConverted;
        let customEntitiesAreConverted;

        before(() => {
          const jdlObject = new JDLObject();
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
          application.addEntityName('A');
          application.addEntityName('User');
          application.addEntityName('Authority');
          jdlObject.addApplication(application);
          const returnedMap: any = convert({
            jdlObject,
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
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          application.addEntityName('A');
          jdlObject.addApplication(application);
          jdlObject.addEntity(entityA);
          const returnedMap: any = convert({
            jdlObject,
          });
          convertedEntity = returnedMap.get('toto')[0];
        });

        it('should convert the entity', () => {
          jestExpect(convertedEntity).toMatchInlineSnapshot(`
JSONEntity {
  "applications": Array [
    "toto",
  ],
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
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          application.addEntityName('A');
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
          jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          application.addEntityName('A');
          jdlObject.addApplication(application);
          jdlObject.addOption(
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              value: binaryOptions.Values.dto.MAPSTRUCT,
              entityNames: ['A'],
            })
          );
          const returnedMap: any = convert({
            jdlObject,
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
  "applications": Array [
    "toto",
  ],
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
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          application.addEntityName('A');
          jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
          const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          jdlObject.addEntity(entityA);
          application.addEntityName('A');
          jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            jdlObject.addApplication(application);
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
  "applications": Array [
    "toto",
  ],
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            application.addEntityName('B');
            jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            application.addEntityName('B');
            jdlObject.addApplication(application);
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
            const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
            application.addEntityName('A');
            application.addEntityName('B');
            jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
              const application = createJDLApplication({ applicationType: MONOLITH, baseName: 'toto' });
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
              application.addEntityName('A');
              application.addEntityName('B');
              jdlObject.addApplication(application);
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
      context('with application options', () => {
        let convertedEntitiesForTataApplication;
        let convertedEntitiesForTutuApplication;

        before(() => {
          const jdlObject = new JDLObject();
          const tataApplication = createJDLApplication({ applicationType: MONOLITH, baseName: 'tata' });
          const tutuApplication = createJDLApplication({ applicationType: MONOLITH, baseName: 'tutu' });
          const entityA = new JDLEntity({
            name: 'A',
            tableName: 'entity_a',
            comment: 'The best entity',
          });
          const entityB = new JDLEntity({
            name: 'B',
            tableName: 'entity_b',
            comment: 'The best entity',
          });
          const entityC = new JDLEntity({
            name: 'C',
            tableName: 'entity_c',
            comment: 'The best entity',
          });
          const entityD = new JDLEntity({
            name: 'D',
            tableName: 'entity_d',
            comment: 'The best entity',
          });
          const entityE = new JDLEntity({
            name: 'E',
            tableName: 'entity_e',
            comment: 'The best entity',
          });
          const entityF = new JDLEntity({
            name: 'F',
            tableName: 'entity_f',
            comment: 'The best entity',
          });
          const paginationWithInfiniteScrollOption = new JDLBinaryOption({
            name: binaryOptions.Options.PAGINATION,
            value: binaryOptions.Values.pagination['INFINITE-SCROLL'],
            entityNames: ['A', 'B', 'C', 'D', 'E', 'F'],
          });
          const paginationWithPaginationOption = new JDLBinaryOption({
            name: binaryOptions.Options.PAGINATION,
            value: binaryOptions.Values.pagination.PAGINATION,
            entityNames: ['A', 'C'],
          });
          const dtoWithMapstructOption = new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['D', 'F'],
          });
          jdlObject.addOption(paginationWithInfiniteScrollOption);
          tataApplication.addOption(paginationWithPaginationOption);
          tutuApplication.addOption(dtoWithMapstructOption);
          tataApplication.addEntityName('A');
          tataApplication.addEntityName('B');
          tataApplication.addEntityName('C');
          tutuApplication.addEntityName('C');
          tutuApplication.addEntityName('D');
          tutuApplication.addEntityName('E');
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addEntity(entityC);
          jdlObject.addEntity(entityD);
          jdlObject.addEntity(entityE);
          jdlObject.addEntity(entityF);
          jdlObject.addApplication(tataApplication);
          jdlObject.addApplication(tutuApplication);
          const returnedMap: any = convert({
            jdlObject,
          });
          convertedEntitiesForTataApplication = returnedMap.get('tata');
          convertedEntitiesForTutuApplication = returnedMap.get('tutu');
        });

        it('should set them', () => {
          jestExpect(convertedEntitiesForTataApplication).toMatchInlineSnapshot(`
Array [
  JSONEntity {
    "applications": Array [
      "tata",
    ],
    "dto": "no",
    "embedded": false,
    "entityTableName": "entity_a",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "A",
    "pagination": "pagination",
    "readOnly": false,
    "relationships": Array [],
    "service": "no",
  },
  JSONEntity {
    "applications": Array [
      "tata",
    ],
    "dto": "no",
    "embedded": false,
    "entityTableName": "entity_b",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "B",
    "pagination": "infinite-scroll",
    "readOnly": false,
    "relationships": Array [],
    "service": "no",
  },
  JSONEntity {
    "applications": Array [
      "tata",
      "tutu",
    ],
    "dto": "no",
    "embedded": false,
    "entityTableName": "entity_c",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "C",
    "pagination": "pagination",
    "readOnly": false,
    "relationships": Array [],
    "service": "no",
  },
]
`);
          jestExpect(convertedEntitiesForTutuApplication).toMatchInlineSnapshot(`
Array [
  JSONEntity {
    "applications": Array [
      "tata",
      "tutu",
    ],
    "dto": "no",
    "embedded": false,
    "entityTableName": "entity_c",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "C",
    "pagination": "pagination",
    "readOnly": false,
    "relationships": Array [],
    "service": "no",
  },
  JSONEntity {
    "applications": Array [
      "tutu",
    ],
    "dto": "mapstruct",
    "embedded": false,
    "entityTableName": "entity_d",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "D",
    "pagination": "infinite-scroll",
    "readOnly": false,
    "relationships": Array [],
    "service": "serviceClass",
  },
  JSONEntity {
    "applications": Array [
      "tutu",
    ],
    "dto": "no",
    "embedded": false,
    "entityTableName": "entity_e",
    "fields": Array [],
    "fluentMethods": true,
    "javadoc": "The best entity",
    "jpaMetamodelFiltering": false,
    "name": "E",
    "pagination": "infinite-scroll",
    "readOnly": false,
    "relationships": Array [],
    "service": "no",
  },
]
`);
        });
      });
    });
  });
});

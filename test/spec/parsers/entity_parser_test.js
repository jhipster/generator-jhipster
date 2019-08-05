/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const EntityParser = require('../../../lib/parsers/entity_parser');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLMicroserviceApplication = require('../../../lib/core/jdl_microservice_application');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');
const JDLEnum = require('../../../lib/core/jdl_enum');
const JDLValidation = require('../../../lib/core/jdl_validation');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const JDLRelationships = require('../../../lib/core/jdl_relationships');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const FieldTypes = require('../../../lib/core/jhipster/field_types');
const Validations = require('../../../lib/core/jhipster/validations');
const UnaryOptions = require('../../../lib/core/jhipster/unary_options');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options').Options;
const BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').Values;
const RelationshipTypes = require('../../../lib/core/jhipster/relationship_types');

describe('EntityParser', () => {
  describe('::parse', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          expect(() => {
            EntityParser.parse();
          }).to.throw('The JDL object and the database type are both mandatory.');
        });
      });
      context('such as an no databaseType', () => {
        it('throws an error', () => {
          expect(() => {
            EntityParser.parse({ jdlObject: new JDLObject() });
          }).to.throw('The JDL object and the database type are both mandatory.');
        });
      });

      context('such as an app with Cassandra and relationships between entities', () => {
        let jdlObject = null;

        before(() => {
          const entityA = new JDLEntity({
            name: 'EntityA',
            tableName: 'a',
            fields: {
              aa: new JDLField({
                name: 'aa',
                type: FieldTypes.CommonDBTypes.STRING,
                comment: 'My field',
                validations: { required: new JDLValidation({ name: Validations.REQUIRED }) }
              }),
              ab: new JDLField({
                name: 'ab',
                type: FieldTypes.CommonDBTypes.ZONED_DATE_TIME
              })
            }
          });
          const entityB = new JDLEntity({
            name: 'EntityB',
            fields: {}
          });
          const oneToOneRelationship = new JDLRelationship({
            type: RelationshipTypes.ONE_TO_ONE,
            from: entityA.name,
            to: entityB.name,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            isInjectedFieldInFromRequired: true
          });
          const microserviceOption = new JDLBinaryOption({
            name: BinaryOptions.MICROSERVICE,
            value: 'myMs'
          });
          jdlObject = new JDLObject();
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addRelationship(oneToOneRelationship);
          jdlObject.addOption(microserviceOption);
        });

        it('throws an error', () => {
          expect(() => {
            EntityParser.parse({
              jdlObject,
              databaseType: DatabaseTypes.CASSANDRA,
              applicationType: ApplicationTypes.MICROSERVICE
            });
          }).to.throw("Cassandra entities don't have relationships.");
        });
      });
    });
    context('when passing valid arguments', () => {
      let content = null;
      let jdlObject = null;

      before(() => {
        const entityA = new JDLEntity({
          name: 'EntityA',
          tableName: 'a',
          fields: {
            aa: new JDLField({
              name: 'aa',
              type: FieldTypes.CommonDBTypes.STRING,
              comment: 'My field',
              validations: { required: new JDLValidation({ name: Validations.REQUIRED }) }
            }),
            ab: new JDLField({
              name: 'ab',
              type: FieldTypes.CommonDBTypes.ZONED_DATE_TIME
            })
          }
        });
        const enumObject = new JDLEnum({
          name: 'EnumA',
          values: ['A', 'B', 'C']
        });
        const entityB = new JDLEntity({
          name: 'EntityB',
          fields: {
            ba: new JDLField({
              name: 'ba',
              type: enumObject.name
            })
          }
        });
        const oneToOneRelationship = new JDLRelationship({
          type: RelationshipTypes.ONE_TO_ONE,
          from: entityA.name,
          to: entityB.name,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a',
          isInjectedFieldInFromRequired: true
        });
        const skipClientOption = new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entityNames: [entityA.name]
        });
        const paginationOption = new JDLBinaryOption({
          name: BinaryOptions.PAGINATION,
          value: BinaryOptionValues.pagination.PAGER,
          excludedNames: [entityB.name]
        });
        const microserviceOption = new JDLBinaryOption({
          name: BinaryOptions.MICROSERVICE,
          value: 'myMs'
        });
        jdlObject = new JDLObject();
        jdlObject.addEntity(entityA);
        jdlObject.addEntity(entityB);
        jdlObject.addEnum(enumObject);
        jdlObject.addRelationship(oneToOneRelationship);
        jdlObject.addOption(skipClientOption);
        jdlObject.addOption(paginationOption);
        jdlObject.addOption(microserviceOption);
      });

      context('when passing args for a gateway app', () => {
        it('does not fail because of NoSQL modeling mistakes', () => {
          EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.CASSANDRA,
            applicationType: ApplicationTypes.GATEWAY
          });
        });
      });
      context('when converting JDL to entity json for SQL type', () => {
        before(() => {
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.MYSQL
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content)).to.have.length(2);
          expect(content.EntityA.changelogDate).not.to.be.undefined;
          expect(content.EntityB.changelogDate).not.to.be.undefined;
          delete content.EntityA.changelogDate;
          delete content.EntityB.changelogDate;
          expect(content).to.deep.equal({
            EntityA: {
              name: 'EntityA',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'a',
              fields: [
                {
                  fieldName: 'aa',
                  fieldType: 'String',
                  fieldValidateRules: ['required'],
                  javadoc: 'My field'
                },
                {
                  fieldName: 'ab',
                  fieldType: 'ZonedDateTime'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'pager',
              relationships: [
                {
                  otherEntityField: 'id',
                  otherEntityName: 'entityB',
                  otherEntityRelationshipName: 'a',
                  ownerSide: true,
                  relationshipName: 'b',
                  relationshipType: 'one-to-one',
                  relationshipValidateRules: 'required'
                }
              ],
              service: 'no',
              skipClient: true
            },
            EntityB: {
              name: 'EntityB',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'entity_b',
              fields: [
                {
                  fieldName: 'ba',
                  fieldType: 'EnumA',
                  fieldValues: 'A,B,C'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'no',
              relationships: [
                {
                  otherEntityName: 'entityA',
                  otherEntityRelationshipName: 'b',
                  ownerSide: false,
                  relationshipName: 'a',
                  relationshipType: 'one-to-one'
                }
              ],
              service: 'no'
            }
          });
        });
      });
      context('when converting JDL to entity json for MongoDB type', () => {
        before(() => {
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.MONGODB
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content)).to.have.length(2);
          expect(content.EntityA.changelogDate).not.to.be.undefined;
          expect(content.EntityB.changelogDate).not.to.be.undefined;
          delete content.EntityA.changelogDate;
          delete content.EntityB.changelogDate;
          expect(content).to.deep.equal({
            EntityA: {
              name: 'EntityA',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'a',
              fields: [
                {
                  fieldName: 'aa',
                  fieldType: 'String',
                  fieldValidateRules: ['required'],
                  javadoc: 'My field'
                },
                {
                  fieldName: 'ab',
                  fieldType: 'ZonedDateTime'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'pager',
              relationships: [
                {
                  otherEntityField: 'id',
                  otherEntityName: 'entityB',
                  otherEntityRelationshipName: 'a',
                  ownerSide: true,
                  relationshipName: 'b',
                  relationshipType: 'one-to-one',
                  relationshipValidateRules: 'required'
                }
              ],
              service: 'no',
              skipClient: true
            },
            EntityB: {
              name: 'EntityB',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'entity_b',
              fields: [
                {
                  fieldName: 'ba',
                  fieldType: 'EnumA',
                  fieldValues: 'A,B,C'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'no',
              relationships: [
                {
                  otherEntityName: 'entityA',
                  otherEntityRelationshipName: 'b',
                  ownerSide: false,
                  relationshipName: 'a',
                  relationshipType: 'one-to-one'
                }
              ],
              service: 'no'
            }
          });
        });
      });
      context('when converting JDL to entity json for Couchbase type', () => {
        before(() => {
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.COUCHBASE
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content)).to.have.length(2);
          expect(content.EntityA.changelogDate).not.to.be.undefined;
          expect(content.EntityB.changelogDate).not.to.be.undefined;
          delete content.EntityA.changelogDate;
          delete content.EntityB.changelogDate;
          expect(content).to.deep.equal({
            EntityA: {
              name: 'EntityA',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'a',
              fields: [
                {
                  fieldName: 'aa',
                  fieldType: 'String',
                  fieldValidateRules: ['required'],
                  javadoc: 'My field'
                },
                {
                  fieldName: 'ab',
                  fieldType: 'ZonedDateTime'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'pager',
              relationships: [
                {
                  otherEntityField: 'id',
                  otherEntityName: 'entityB',
                  otherEntityRelationshipName: 'a',
                  ownerSide: true,
                  relationshipName: 'b',
                  relationshipType: 'one-to-one',
                  relationshipValidateRules: 'required'
                }
              ],
              service: 'no',
              skipClient: true
            },
            EntityB: {
              name: 'EntityB',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'entity_b',
              fields: [
                {
                  fieldName: 'ba',
                  fieldType: 'EnumA',
                  fieldValues: 'A,B,C'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'no',
              relationships: [
                {
                  otherEntityName: 'entityA',
                  otherEntityRelationshipName: 'b',
                  ownerSide: false,
                  relationshipName: 'a',
                  relationshipType: 'one-to-one'
                }
              ],
              service: 'no'
            }
          });
        });
      });
      context('when converting JDL to entity json for Cassandra type', () => {
        let content = null;

        before(() => {
          jdlObject.relationships = new JDLRelationships();
          content = EntityParser.parse({
            jdlObject,
            applicationType: ApplicationTypes.GATEWAY,
            databaseType: DatabaseTypes.CASSANDRA
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content)).to.have.length(2);
          expect(content.EntityA.changelogDate).not.to.be.undefined;
          expect(content.EntityB.changelogDate).not.to.be.undefined;
          delete content.EntityA.changelogDate;
          delete content.EntityB.changelogDate;
          expect(content).to.deep.equal({
            EntityA: {
              name: 'EntityA',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'a',
              fields: [
                {
                  fieldName: 'aa',
                  fieldType: 'String',
                  fieldValidateRules: ['required'],
                  javadoc: 'My field'
                },
                {
                  fieldName: 'ab',
                  fieldType: 'ZonedDateTime'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'pager',
              relationships: [],
              service: 'no',
              skipClient: true
            },
            EntityB: {
              name: 'EntityB',
              applications: '*',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'entity_b',
              fields: [
                {
                  fieldName: 'ba',
                  fieldType: 'EnumA',
                  fieldValues: 'A,B,C'
                }
              ],
              fluentMethods: true,
              javadoc: undefined,
              jpaMetamodelFiltering: false,
              microserviceName: 'myMs',
              pagination: 'no',
              relationships: [],
              service: 'no'
            }
          });
        });
      });
      context('when converting a JDL to JSON with all different types of bi-directional relationships', () => {
        let content = null;

        before(() => {
          const entityA = new JDLEntity({
            name: 'A'
          });
          const entityB = new JDLEntity({
            name: 'B'
          });
          const oneToManyRelationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            type: RelationshipTypes.ONE_TO_MANY
          });
          const manyToOneRelationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInFrom: 'bb',
            injectedFieldInTo: 'aa',
            type: RelationshipTypes.MANY_TO_ONE
          });
          const manyToManyRelationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInFrom: 'bbb',
            injectedFieldInTo: 'aaa',
            type: RelationshipTypes.MANY_TO_MANY
          });
          const oneToOneRelationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInFrom: 'bbbb',
            injectedFieldInTo: 'aaaa',
            type: RelationshipTypes.ONE_TO_ONE
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addRelationship(oneToManyRelationship);
          jdlObject.addRelationship(oneToOneRelationship);
          jdlObject.addRelationship(manyToManyRelationship);
          jdlObject.addRelationship(manyToOneRelationship);
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('converts it', () => {
          expect(content.A.relationships).to.deep.eq([
            {
              relationshipName: 'bbbb',
              otherEntityName: 'b',
              relationshipType: 'one-to-one',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'aaaa'
            },
            {
              relationshipName: 'b',
              otherEntityName: 'b',
              relationshipType: 'one-to-many',
              otherEntityRelationshipName: 'a'
            },
            {
              relationshipName: 'bb',
              otherEntityName: 'b',
              relationshipType: 'many-to-one',
              otherEntityField: 'id',
              otherEntityRelationshipName: 'aa'
            },
            {
              relationshipName: 'bbb',
              otherEntityName: 'b',
              relationshipType: 'many-to-many',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'aaa'
            }
          ]);
          expect(content.B.relationships).to.deep.eq([
            {
              relationshipName: 'aaaa',
              otherEntityName: 'a',
              relationshipType: 'one-to-one',
              ownerSide: false,
              otherEntityRelationshipName: 'bbbb'
            },
            {
              relationshipName: 'a',
              otherEntityName: 'a',
              relationshipType: 'many-to-one',
              otherEntityField: 'id',
              otherEntityRelationshipName: 'b'
            },
            {
              relationshipName: 'aa',
              otherEntityName: 'a',
              relationshipType: 'one-to-many',
              otherEntityRelationshipName: 'bb'
            },
            {
              relationshipName: 'aaa',
              otherEntityName: 'a',
              relationshipType: 'many-to-many',
              ownerSide: false,
              otherEntityField: 'id',
              otherEntityRelationshipName: 'bbb'
            }
          ]);
        });
      });
      context('when converting a JDL with blobs', () => {
        let content = null;

        before(() => {
          const jdlObject = new JDLObject();
          jdlObject.addEntity(
            new JDLEntity({
              name: 'A',
              fields: {
                anyBlob: new JDLField({
                  name: 'anyBlob',
                  type: FieldTypes.CommonDBTypes.ANY_BLOB
                }),
                imageBlob: new JDLField({
                  name: 'imageBlob',
                  type: FieldTypes.CommonDBTypes.IMAGE_BLOB
                }),
                textBlob: new JDLField({
                  name: 'textBlob',
                  type: FieldTypes.CommonDBTypes.TEXT_BLOB
                })
              }
            })
          );
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('converts it', () => {
          expect(content.A.fields).to.deep.eq([
            {
              fieldName: 'anyBlob',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'any'
            },
            {
              fieldName: 'imageBlob',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'image'
            },
            {
              fieldName: 'textBlob',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'text'
            }
          ]);
        });
      });
      context('when converting a JDL with elastic except', () => {
        let content = null;

        before(() => {
          const entityA = new JDLEntity({ name: 'A' });
          const entityB = new JDLEntity({ name: 'B' });
          const option = new JDLBinaryOption({
            name: BinaryOptions.SEARCH_ENGINE,
            value: 'elasticsearch',
            excludedNames: ['B']
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addOption(option);
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('converts it', () => {
          expect(content.A.searchEngine).to.equal('elasticsearch');
          expect(content.B.searchEngine).to.be.false;
        });
      });
      context('when converting a JDL with filtering', () => {
        context('if there was not a service option for entity', () => {
          let content = null;

          before(() => {
            const entityA = new JDLEntity({ name: 'A' });
            const entityB = new JDLEntity({ name: 'B' });
            const option = new JDLUnaryOption({
              name: UnaryOptions.FILTER,
              excludedNames: ['B']
            });
            const jdlObject = new JDLObject();
            jdlObject.addEntity(entityA);
            jdlObject.addEntity(entityB);
            jdlObject.addOption(option);
            content = EntityParser.parse({
              jdlObject,
              databaseType: DatabaseTypes.SQL
            });
          });

          it('converts it', () => {
            expect(content.A.jpaMetamodelFiltering).to.be.true;
            expect(content.B.jpaMetamodelFiltering).to.be.false;
          });
          it('adds the default service option for the filtered entity', () => {
            expect(content.A.service).to.equal('serviceClass');
          });
          it('keeps the other entities the same', () => {
            expect(content.B.service).to.equal('no');
          });
        });
        context('if there was a service option for the entity', () => {
          let content = null;

          before(() => {
            const entityA = new JDLEntity({ name: 'A' });
            const entityB = new JDLEntity({ name: 'B' });
            const filterOption = new JDLUnaryOption({
              name: UnaryOptions.FILTER,
              excludedNames: ['B']
            });
            const serviceOption = new JDLBinaryOption({
              name: BinaryOptions.SERVICE,
              value: BinaryOptionValues.service.SERVICE_IMPL,
              entityNames: ['A']
            });
            const jdlObject = new JDLObject();
            jdlObject.addEntity(entityA);
            jdlObject.addEntity(entityB);
            jdlObject.addOption(filterOption);
            jdlObject.addOption(serviceOption);
            content = EntityParser.parse({
              jdlObject,
              databaseType: DatabaseTypes.SQL
            });
          });

          it('converts it', () => {
            expect(content.A.jpaMetamodelFiltering).to.be.true;
            expect(content.B.jpaMetamodelFiltering).to.be.false;
          });
          it('keeps both entities the same', () => {
            expect(content.A.service).to.equal('serviceImpl');
            expect(content.B.service).to.equal('no');
          });
        });
      });
      context('when parsing a JDL application with entities inside', () => {
        let content = null;

        before(() => {
          const application = new JDLMicroserviceApplication({
            config: {
              baseName: 'MyApp'
            },
            entities: ['A']
          });
          const entityA = new JDLEntity({ name: 'A' });
          const entityB = new JDLEntity({ name: 'B' });
          const jdlObject = new JDLObject();
          jdlObject.addApplication(application);
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('adds the application name inside the entities', () => {
          expect(content.A.applications).to.deep.equal(['MyApp']);
        });
        it('does not add the application name if excluded', () => {
          expect(content.B.applications).to.deep.equal([]);
        });
      });
      context('when parsing a relationship with no from injected field for a one-to-one', () => {
        let content = null;

        before(() => {
          const entityA = new JDLEntity({ name: 'A' });
          const entityB = new JDLEntity({ name: 'B' });
          const relationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInTo: 'a',
            type: RelationshipTypes.ONE_TO_ONE
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addRelationship(relationship);
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('sets one by default', () => {
          expect(content.A.relationships[0].relationshipName).to.equal('b');
          expect(content.B.relationships[0].otherEntityRelationshipName).to.equal('b');
        });
      });
      context('when parsing a relationship with a useJPADerivedIdentifier flag', () => {
        let content = null;

        before(() => {
          const entityA = new JDLEntity({ name: 'A' });
          const entityB = new JDLEntity({ name: 'B' });
          const relationship = new JDLRelationship({
            from: entityA.name,
            to: entityB.name,
            injectedFieldInTo: 'a',
            type: RelationshipTypes.ONE_TO_ONE,
            options: new Set(['jpaDerivedIdentifier'])
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(entityA);
          jdlObject.addEntity(entityB);
          jdlObject.addRelationship(relationship);
          content = EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL
          });
        });

        it('sets it', () => {
          expect(content.A.relationships[0].useJPADerivedIdentifier).to.be.true;
        });
      });
      context('when converting a JDL with DTO', () => {
        context('if there was not a service option for entity', () => {
          let content;

          before(() => {
            const entity = new JDLEntity({ name: 'A' });
            const jdlObject = new JDLObject();
            const option = new JDLBinaryOption({
              name: BinaryOptions.DTO,
              value: BinaryOptionValues.dto.MAPSTRUCT
            });
            jdlObject.addEntity(entity);
            jdlObject.addOption(option);
            content = EntityParser.parse({
              jdlObject,
              databaseType: DatabaseTypes.SQL
            });
          });

          it('sets one as default', () => {
            expect(content.A.service).to.equal('serviceClass');
          });
        });
        context('if there was a service option for the entity', () => {
          let content = null;

          before(() => {
            const entityA = new JDLEntity({ name: 'A' });
            const dtoOption = new JDLBinaryOption({
              name: BinaryOptions.DTO,
              value: BinaryOptionValues.dto.MAPSTRUCT
            });
            const serviceOption = new JDLBinaryOption({
              name: BinaryOptions.SERVICE,
              value: BinaryOptionValues.service.SERVICE_IMPL,
              entityNames: ['A']
            });
            const jdlObject = new JDLObject();
            jdlObject.addEntity(entityA);
            jdlObject.addOption(dtoOption);
            jdlObject.addOption(serviceOption);
            content = EntityParser.parse({
              jdlObject,
              databaseType: DatabaseTypes.SQL
            });
          });

          it('uses the wanted service instead of the default one', () => {
            expect(content.A.service).to.equal('serviceImpl');
          });
        });
      });
    });
    context("when passing 'no' as database type", () => {
      let jdlObject = null;
      let result = null;

      before(() => {
        jdlObject = new JDLObject();
        const entity = new JDLEntity({
          name: 'Toto'
        });
        const field1 = new JDLField({
          name: 'titi',
          type: FieldTypes.CassandraTypes.UUID
        });
        const field2 = new JDLField({
          name: 'tutu',
          type: FieldTypes.CommonDBTypes.STRING
        });
        entity.addField(field1);
        entity.addField(field2);
        jdlObject.addEntity(entity);
        result = EntityParser.parse({
          jdlObject,
          databaseType: DatabaseTypes.NO,
          applicationType: ApplicationTypes.MICROSERVICE
        });
        delete result.Toto.changelogDate;
      });

      it('converts everything into JSON', () => {
        expect(result).to.deep.equal({
          Toto: {
            name: 'Toto',
            applications: '*',
            clientRootFolder: '',
            dto: 'no',
            entityTableName: 'toto',
            fields: [
              {
                fieldName: 'titi',
                fieldType: 'UUID'
              },
              {
                fieldName: 'tutu',
                fieldType: 'String'
              }
            ],
            fluentMethods: true,
            javadoc: undefined,
            jpaMetamodelFiltering: false,
            pagination: 'no',
            relationships: [],
            service: 'no'
          }
        });
      });
    });
    context('when passing a JDL object with a wrong field type', () => {
      let jdlObject = null;

      before(() => {
        const entityA = new JDLEntity({
          name: 'A'
        });
        const entityB = new JDLEntity({
          name: 'B'
        });
        const relationship = new JDLRelationship({
          from: entityA.name,
          to: entityB.name,
          type: RelationshipTypes.ONE_TO_MANY,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a'
        });
        const field = new JDLField({
          name: 'toto',
          type: 'DoesNotExistAtAll'
        });
        jdlObject = new JDLObject();
        entityA.addField(field);
        jdlObject.addEntity(entityA);
        jdlObject.addEntity(entityB);
        jdlObject.addRelationship(relationship);
      });

      it('fails', () => {
        expect(() => {
          EntityParser.parse({
            jdlObject,
            databaseType: DatabaseTypes.SQL,
            applicationType: ApplicationTypes.MICROSERVICE
          });
        }).to.throw("No valable field type could be resolved for field 'toto' of entity 'A', got 'DoesNotExistAtAll'");
      });
    });
  });
});

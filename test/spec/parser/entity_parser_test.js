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
const DocumentParser = require('../../../lib/parser/document_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types').Types;

describe('EntityParser', () => {
  describe('::convert', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          try {
            EntityParser.parse();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      context('such as an no databaseType', () => {
        let input = null;

        before(() => {
          input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
        });

        it('throws an error', () => {
          try {
            EntityParser.parse({ jdlObject: DocumentParser.parse(input, 'sql') });
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      context('such as invalid databaseType', () => {
        let input = null;

        before(() => {
          input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
        });

        it('throws an error', () => {
          try {
            EntityParser.parse({
              jdlObject: DocumentParser.parse(input, 'sql'),
              databaseType: 'mongodb'
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('NoSQLModelingException');
          }
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when passing args for a gateway app', () => {
        let input = null;

        before(() => {
          input = parseFromFiles(['./test/test_files/cassandra_with_relationships.jdl']);
        });

        it('does not fail because of NoSQL modeling mistakes', () => {
          EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'cassandra'),
            databaseType: 'cassandra',
            applicationType: 'gateway'
          });
        });
      });
      context('when converting JDL to entity json for SQL type', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'mysql'),
            databaseType: 'mysql'
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content).length).to.eq(8);
          for (let i = 0, entities = Object.keys(content); i < entities.length; i++) {
            expect(content[entities[i]].fluentMethods).to.eq(true);
          }
          expect(content.Department.relationships.length).to.eq(2);
          expect(content.Department.relationships[1].javadoc).to.eq('A relationship');
          expect(content.Department.fields.length).to.eq(5);
          expect(content.Department.entityTableName).to.eq('department');
          expect(content.Employee.javadoc).to.eq('The Employee entity.\nSecond line in javadoc.');
          expect(content.Employee.pagination).to.eq('infinite-scroll');
          expect(content.Employee.relationships[3].javadoc).to.eq('Another side of the same relationship');
          expect(content.Job.relationships[0].otherEntityRelationshipName).to.eq('job');
          expect(content.Task.relationships[0].otherEntityRelationshipName).to.eq('chore');
        });
      });
      context('when converting JDL to entity json for MongoDB type', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/mongo_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'mongodb'),
            databaseType: 'mongodb'
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content).length).to.eq(8);
          expect(content.Department.relationships.length).to.eq(0);
          expect(content.Department.fields.length).to.eq(2);
          expect(content.Department.entityTableName).to.eq('department');
          expect(content.Employee.javadoc).to.eq('The Employee entity.');
          expect(content.Employee.pagination).to.eq('infinite-scroll');
        });
      });
      context('when converting JDL to entity json for Couchbase type', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/couchbase_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'couchbase'),
            databaseType: 'couchbase'
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content).length).to.eq(8);
          expect(content.Department.relationships.length).to.eq(0);
          expect(content.Department.fields.length).to.eq(2);
          expect(content.Department.entityTableName).to.eq('department');
          expect(content.Employee.javadoc).to.eq('The Employee entity.');
          expect(content.Employee.pagination).to.eq('infinite-scroll');
        });
      });
      context('when converting JDL to entity json for Cassandra type', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/cassandra_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'cassandra'),
            databaseType: 'cassandra'
          });
        });

        it('converts it', () => {
          expect(content).not.to.be.null;
          expect(Object.keys(content).length).to.eq(8);
          expect(content.Department.relationships.length).to.eq(0);
          expect(content.Department.fields.length).to.eq(2);
          expect(content.Department.entityTableName).to.eq('department');
          expect(content.Employee.javadoc).to.eq('The Employee entity.');
          expect(content.Employee.pagination).to.eq('no');
        });
      });
      context('when converting a JDL to JSON with a required relationship', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/required_relationships.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'sql'),
            databaseType: 'sql'
          });
        });

        it('converts it', () => {
          expect(content.A.relationships).to.deep.eq([{
            otherEntityField: 'id',
            otherEntityName: 'b',
            otherEntityRelationshipName: 'a',
            ownerSide: true,
            relationshipName: 'b',
            relationshipType: 'one-to-one',
            relationshipValidateRules: 'required'
          }]);
        });
      });
      context('when converting a JDL to JSON with fluent methods', () => {
        let input = null;
        let content = null;

        before(() => {
          input = parseFromFiles(['./test/test_files/fluent_methods.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'sql'),
            databaseType: 'sql'
          });
        });

        it('converts it', () => {
          expect(content.A.fluentMethods).to.be.false;
          expect(content.B.fluentMethods).to.be.true;
          expect(content.C.fluentMethods).to.be.true;
        });

        context('when converting twice', () => {
          before(() => {
            input = parseFromFiles(['./test/test_files/fluent_methods2.jdl']);
            content = EntityParser.parse({
              jdlObject: DocumentParser.parse(input, 'sql'),
              databaseType: 'sql'
            });
          });

          it('converts it', () => {
            expect(content.A.fluentMethods).to.be.true;
            expect(content.B.fluentMethods).to.be.false;
            expect(content.C.fluentMethods).to.be.false;
          });
        });
      });
      context('when converting a JDL to JSON with all different types of bi-directional relationships', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/different_relationship_types.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'sql'),
            databaseType: 'sql'
          });
        });

        it('converts it', () => {
          expect(content.A.relationships).to.deep.eq(
            [
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
                otherEntityField: 'id'
              },
              {
                relationshipName: 'bbb',
                otherEntityName: 'b',
                relationshipType: 'many-to-many',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'aaa'
              }
            ]
          );
          expect(content.B.relationships).to.deep.eq(
            [
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
                otherEntityField: 'id'
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
                otherEntityRelationshipName: 'bbb'
              }
            ]
          );
        });
      });
      context('when converting a JDL with blobs', () => {
        let content = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/blob_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: DocumentParser.parse(input, 'sql'),
            databaseType: 'sql'
          });
        });

        it('converts it', () => {
          expect(content.A.fields).to.deep.eq(
            [
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
            ]
          );
        });
      });
      context('when converting a JDL with filtering', () => {
        context('if there was not a service option for entity', () => {
          let content = null;

          before(() => {
            const input = parseFromFiles(['./test/test_files/filtering_without_service.jdl']);
            const jdlObject = DocumentParser.parse(input, 'sql');
            content = EntityParser.parse({
              jdlObject,
              databaseType: 'sql'
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
            const input = parseFromFiles(['./test/test_files/filtering_with_service.jdl']);
            content = EntityParser.parse({
              jdlObject: DocumentParser.parse(input, 'sql'),
              databaseType: 'sql'
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
      context('when converting a JDL inside a microservice app', () => {
        context('without the microservice option in the JDL', () => {
          let content = null;

          before(() => {
            const input = parseFromFiles(['./test/test_files/no_microservice.jdl']);
            content = EntityParser.parse({
              jdlObject: DocumentParser.parse(input, DatabaseTypes.sql, ApplicationTypes.MICROSERVICE, 'toto'),
              databaseType: DatabaseTypes.sql
            });
          });

          it('adds it to every entity', () => {
            Object.keys(content).forEach((entityName) => {
              expect(content[entityName].microserviceName).to.equal('toto');
            });
          });
        });
      });
      context('when converting a JDL with custom client root folder', () => {
        context('inside a microservice app', () => {
          let content = null;

          before(() => {
            const input = parseFromFiles(['./test/test_files/client_root_folder.jdl']);
            content = EntityParser.parse({
              jdlObject: DocumentParser.parseFromConfigurationObject({
                document: input,
                databaseType: 'sql',
                applicationType: ApplicationTypes.MICROSERVICE
              }),
              databaseType: DatabaseTypes.sql
            });
          });

          it('does not set the option', () => {
            Object.keys(content).forEach((entityName) => {
              expect(content[entityName].clientRootFolder).to.equal('');
            });
          });
        });
        context('inside any other application', () => {
          let content = null;

          before(() => {
            const input = parseFromFiles(['./test/test_files/client_root_folder.jdl']);
            content = EntityParser.parse({
              jdlObject: DocumentParser.parseFromConfigurationObject({
                document: input,
                databaseType: 'sql',
                applicationType: ApplicationTypes.GATEWAY
              }),
              databaseType: DatabaseTypes.sql
            });
          });

          it('uses it', () => {
            expect(content.A.clientRootFolder).to.equal('test-root');
            expect(content.B.clientRootFolder).to.equal('test-root');
            expect(content.C.clientRootFolder).to.equal('');
          });
        });
      });
    });
  });
});


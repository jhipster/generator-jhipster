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
const fs = require('fs');

const fail = expect.fail;
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const Exporter = require('../../../lib/export/jhipster_entity_exporter');
const DocumentParser = require('../../../lib/parser/document_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;
const FileUtils = require('../../../lib/utils/file_utils');

describe('JHipsterEntityExporter', () => {
  describe('::exportEntities', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          try {
            Exporter.exportToJSON();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when exporting JDL to entity json for SQL type', () => {
        let department = null;
        let jobHistory = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          const content = EntityParser.parse({
            jdlObject: DocumentParser.parseFromConfigurationObject({
              document: input,
              databaseType: 'sql'
            }),
            databaseType: 'sql'
          });
          Exporter.exportToJSON(content);
          department = JSON.parse(fs.readFileSync('.jhipster/Department.json', { encoding: 'utf-8' }));
          jobHistory = JSON.parse(fs.readFileSync('.jhipster/JobHistory.json', { encoding: 'utf-8' }));
        });

        it('exports it', () => {
          expect(fs.statSync('.jhipster/Department.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/JobHistory.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Job.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Employee.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Location.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Task.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Country.json').isFile()).to.be.true;
          expect(fs.statSync('.jhipster/Region.json').isFile()).to.be.true;
          expect(department.relationships).to.deep.eq([
            {
              relationshipType: 'one-to-one',
              relationshipName: 'location',
              otherEntityName: 'location',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'department'
            },
            {
              relationshipType: 'one-to-many',
              javadoc: 'A relationship',
              relationshipName: 'employee',
              otherEntityName: 'employee',
              otherEntityRelationshipName: 'department'
            }
          ]);
          expect(department.fields).to.deep.eq([
            {
              fieldName: 'departmentId',
              fieldType: 'Long'
            },
            {
              fieldName: 'departmentName',
              fieldType: 'String',
              fieldValidateRules: ['required']
            },
            {
              fieldName: 'description',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'text'
            },
            {
              fieldName: 'advertisement',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'any'
            },
            {
              fieldName: 'logo',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'image'
            }
          ]);
          expect(department.dto).to.eq('no');
          expect(department.service).to.eq('no');
          expect(department.pagination).to.eq('no');
          expect(jobHistory.relationships).to.deep.eq([
            {
              relationshipType: 'one-to-one',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'jobHistory'
            },
            {
              relationshipType: 'one-to-one',
              relationshipName: 'job',
              otherEntityName: 'job',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'jobHistory'
            },
            {
              relationshipType: 'one-to-one',
              relationshipName: 'employee',
              otherEntityName: 'employee',
              otherEntityField: 'id',
              ownerSide: true,
              otherEntityRelationshipName: 'jobHistory'
            }
          ]);
          expect(jobHistory.fields).to.deep.eq([
            {
              fieldName: 'startDate',
              fieldType: 'ZonedDateTime'
            },
            {
              fieldName: 'endDate',
              fieldType: 'ZonedDateTime'
            },
            {
              fieldName: 'language',
              fieldType: 'Language',
              fieldValues: 'FRENCH,ENGLISH,SPANISH'
            }
          ]);
          expect(jobHistory.dto).to.eq('no');
          expect(jobHistory.service).to.eq('no');
          expect(jobHistory.pagination).to.eq('infinite-scroll');
        });

        after(() => {
          fs.unlinkSync('.jhipster/Department.json');
          fs.unlinkSync('.jhipster/JobHistory.json');
          fs.unlinkSync('.jhipster/Job.json');
          fs.unlinkSync('.jhipster/Employee.json');
          fs.unlinkSync('.jhipster/Location.json');
          fs.unlinkSync('.jhipster/Task.json');
          fs.unlinkSync('.jhipster/Country.json');
          fs.unlinkSync('.jhipster/Region.json');
          fs.rmdirSync('.jhipster');
        });
      });
      context('when exporting JDL to entity json for an existing entity', () => {
        let changeLogDate = null;

        before(() => {
          const input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
          const content = EntityParser.parse({
            jdlObject: DocumentParser.parseFromConfigurationObject({
              document: input,
              databaseType: 'sql'
            }),
            databaseType: 'sql'
          });
          Exporter.exportToJSON(content);
          changeLogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
        });

        it('exports it with same changeLogDate', (done) => {
          setTimeout(() => {
            const input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
            const content = EntityParser.parse({
              jdlObject: DocumentParser.parseFromConfigurationObject({
                document: input,
                databaseType: 'sql'
              }),
              databaseType: 'sql'
            });
            Exporter.exportToJSON(content, true);
            expect(fs.statSync('.jhipster/A.json').isFile()).to.be.true;
            const newChangeLogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
            expect(newChangeLogDate).to.eq(changeLogDate);
            done();
          }, 1000);
        });

        after(() => {
          fs.unlinkSync('.jhipster/A.json');
          fs.unlinkSync('.jhipster/B.json');
          fs.unlinkSync('.jhipster/C.json');
          fs.unlinkSync('.jhipster/D.json');
          fs.rmdirSync('.jhipster');
        });
      });
      context('when passing an application name and application type', () => {
        context('inside a monolith', () => {
          before(() => {
            const input = parseFromFiles(['./test/test_files/two_microservices.jdl']);
            const content = EntityParser.parse({
              jdlObject: DocumentParser.parseFromConfigurationObject({
                document: input,
                databaseType: 'sql'
              }),
              databaseType: 'sql',
              applicationType: ApplicationTypes.MONOLITH
            });
            Exporter.exportEntities({
              entities: content,
              applicationName: 'client',
              applicationType: ApplicationTypes.MONOLITH
            });
          });

          it('exports every entity', () => {
            expect(FileUtils.doesFileExist('.jhipster/Client.json'));
            expect(FileUtils.doesFileExist('.jhipster/Location.json'));
            expect(FileUtils.doesFileExist('.jhipster/LocalStore.json'));
            expect(FileUtils.doesFileExist('.jhipster/Product.json'));
          });

          after(() => {
            fs.unlinkSync('.jhipster/Client.json');
            fs.unlinkSync('.jhipster/Location.json');
            fs.unlinkSync('.jhipster/LocalStore.json');
            fs.unlinkSync('.jhipster/Product.json');
            fs.rmdirSync('.jhipster');
          });
        });
        context('inside a microservice', () => {
          context('and when entities without the microservice option are passed', () => {
            before(() => {
              const input = parseFromFiles(['./test/test_files/no_microservice.jdl']);
              const content = EntityParser.parse({
                jdlObject: DocumentParser.parseFromConfigurationObject({
                  document: input,
                  databaseType: 'sql'
                }),
                databaseType: 'sql',
                applicationType: ApplicationTypes.MICROSERVICE
              });
              Exporter.exportEntities({
                entities: content,
                applicationName: 'client',
                applicationType: ApplicationTypes.MICROSERVICE
              });
            });

            it('exports every entity', () => {
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((entityName) => {
                expect(FileUtils.doesFileExist(`.jhipster/${entityName}.json`)).to.be.true;
              });
            });

            after(() => {
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((entityName) => {
                fs.unlinkSync(`.jhipster/${entityName}.json`);
              });
              fs.rmdirSync('.jhipster');
            });
          });
          context('and when microservice entities are passed', () => {
            before(() => {
              const input = parseFromFiles(['./test/test_files/two_microservices.jdl']);
              const content = EntityParser.parse({
                jdlObject: DocumentParser.parseFromConfigurationObject({
                  document: input,
                  databaseType: 'sql'
                }),
                databaseType: 'sql',
                applicationType: ApplicationTypes.MICROSERVICE
              });
              Exporter.exportEntities({
                entities: content,
                applicationName: 'client',
                applicationType: ApplicationTypes.MICROSERVICE
              });
            });

            it('only exports the entities that should be inside the microservice', () => {
              expect(FileUtils.doesFileExist('.jhipster/Client.json'));
              expect(FileUtils.doesFileExist('.jhipster/Location.json'));
            });

            after(() => {
              fs.unlinkSync('.jhipster/Client.json');
              fs.unlinkSync('.jhipster/Location.json');
              fs.rmdirSync('.jhipster');
            });
          });
        });
      });
    });
  });
});


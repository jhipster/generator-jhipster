/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const fs = require('fs');
const path = require('path');

const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const JHipsterEntityExporter = require('../../../lib/exporters/jhipster_entity_exporter');
const FileUtils = require('../../../lib/utils/file_utils');

describe('JHipsterEntityExporter', () => {
  describe('exportEntities', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            JHipsterEntityExporter.exportEntities();
          }).to.throw('Entities have to be passed to be exported.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('for only entities and a monolith app', () => {
        let entities;
        let aEntityContent;
        let returned;

        before(() => {
          entities = [
            {
              name: 'A',
              fields: [
                {
                  fieldName: 'myEnum',
                  fieldType: 'MyEnum',
                  fieldValues: 'FRENCH,ENGLISH'
                }
              ],
              relationships: [],
              changelogDate: '42',
              javadoc: '',
              entityTableName: 'a',
              dto: 'no',
              pagination: 'no',
              service: 'no',
              fluentMethods: true,
              jpaMetamodelFiltering: false,
              clientRootFolder: '',
              applications: []
            }
          ];
          returned = JHipsterEntityExporter.exportEntities({
            entities,
            application: {
              name: 'MyApp',
              type: ApplicationTypes.MONOLITH
            }
          });
          aEntityContent = JSON.parse(fs.readFileSync(path.join('.jhipster', 'A.json'), { encoding: 'utf-8' }));
        });

        after(() => {
          fs.unlinkSync('.jhipster/A.json');
          fs.rmdirSync('.jhipster');
        });

        it('should return the exported entities', () => {
          expect(returned).to.deep.equal(entities);
        });
        it('should export the entities', () => {
          expect(aEntityContent).to.deep.equal(entities[0]);
        });
      });
      context('when not exporting entities', () => {
        let returned;

        before(() => {
          returned = JHipsterEntityExporter.exportEntities({
            entities: [],
            application: {
              name: 'MyApp',
              type: ApplicationTypes.MONOLITH
            }
          });
        });
        it('should return an empty list', () => {
          expect(returned).to.deep.equal([]);
        });
        it('should not create a .jhipster folder', () => {
          expect(FileUtils.doesDirectoryExist('.jhipster')).to.be.false;
        });
      });
      context('when exporting the same entity', () => {
        let entities;
        let previousChangelogDate;
        let newChangelogDate;
        let returned;

        before(done => {
          entities = [
            {
              name: 'A',
              fields: [
                {
                  fieldName: 'myEnum',
                  fieldType: 'MyEnum',
                  fieldValues: 'FRENCH,ENGLISH'
                }
              ],
              relationships: [],
              changelogDate: '42',
              javadoc: '',
              entityTableName: 'a',
              dto: 'no',
              pagination: 'no',
              service: 'no',
              fluentMethods: true,
              jpaMetamodelFiltering: false,
              clientRootFolder: '',
              applications: []
            }
          ];
          returned = JHipsterEntityExporter.exportEntities({
            entities,
            application: {
              name: 'MyApp',
              type: ApplicationTypes.MONOLITH
            }
          });
          previousChangelogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
          setTimeout(() => {
            JHipsterEntityExporter.exportEntities({
              entities,
              application: {
                name: 'MyApp',
                type: ApplicationTypes.MONOLITH
              }
            });
            newChangelogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
            done();
          }, 1000);
        });

        it('should return the exported entities', () => {
          expect(returned).to.deep.equal([
            {
              name: 'A',
              applications: [],
              changelogDate: '42',
              clientRootFolder: '',
              dto: 'no',
              entityTableName: 'a',
              fields: [
                {
                  fieldName: 'myEnum',
                  fieldType: 'MyEnum',
                  fieldValues: 'FRENCH,ENGLISH'
                }
              ],
              fluentMethods: true,
              javadoc: '',
              jpaMetamodelFiltering: false,
              pagination: 'no',
              relationships: [],
              service: 'no'
            }
          ]);
        });
        it('should export it with same changelogDate', () => {
          expect(newChangelogDate).to.equal(previousChangelogDate);
        });

        after(() => {
          fs.unlinkSync('.jhipster/A.json');
          fs.rmdirSync('.jhipster');
        });
      });
      context('when passing an application name and application type', () => {
        context('inside a monolith', () => {
          let entities;
          let returned;

          before(() => {
            entities = [
              {
                name: 'Client',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'location',
                    otherEntityName: 'location',
                    otherEntityField: 'id'
                  }
                ],
                changelogDate: '20180303092308',
                entityTableName: 'client',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'client'
              },
              {
                name: 'Location',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'clients',
                    otherEntityName: 'client',
                    otherEntityRelationshipName: 'location'
                  }
                ],
                changelogDate: '20180303092309',
                entityTableName: 'location',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'client'
              },
              {
                name: 'LocalStore',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'products',
                    otherEntityName: 'product',
                    otherEntityRelationshipName: 'store'
                  }
                ],
                changelogDate: '20180303092310',
                entityTableName: 'local_store',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'store'
              },
              {
                name: 'Product',
                fields: [
                  {
                    fieldName: 'name',
                    fieldType: 'String'
                  }
                ],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'store',
                    otherEntityName: 'localStore',
                    otherEntityField: 'id'
                  }
                ],
                changelogDate: '20180303092311',
                entityTableName: 'product',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'store'
              }
            ];
            returned = JHipsterEntityExporter.exportEntities({
              entities,
              application: {
                name: 'client',
                type: ApplicationTypes.MONOLITH
              }
            });
          });

          it('should return the exported entities', () => {
            expect(returned).to.deep.equal([
              {
                name: 'Client',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'location',
                    otherEntityName: 'location',
                    otherEntityField: 'id'
                  }
                ],
                changelogDate: '20180303092308',
                entityTableName: 'client',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'client'
              },
              {
                name: 'Location',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'clients',
                    otherEntityName: 'client',
                    otherEntityRelationshipName: 'location'
                  }
                ],
                changelogDate: '20180303092309',
                entityTableName: 'location',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'client'
              },
              {
                name: 'LocalStore',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'products',
                    otherEntityName: 'product',
                    otherEntityRelationshipName: 'store'
                  }
                ],
                changelogDate: '20180303092310',
                entityTableName: 'local_store',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'store'
              },
              {
                name: 'Product',
                fields: [
                  {
                    fieldName: 'name',
                    fieldType: 'String'
                  }
                ],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'store',
                    otherEntityName: 'localStore',
                    otherEntityField: 'id'
                  }
                ],
                changelogDate: '20180303092311',
                entityTableName: 'product',
                dto: 'no',
                pagination: 'no',
                service: 'serviceClass',
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                clientRootFolder: '',
                applications: '*',
                microserviceName: 'store'
              }
            ]);
          });
          it('should export every entity', () => {
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
            let entities;
            let returnedContent;

            before(() => {
              entities = [
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092920',
                  entityTableName: 'a',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'A'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092921',
                  entityTableName: 'b',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'B'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092922',
                  entityTableName: 'c',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'C'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092923',
                  entityTableName: 'd',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'D'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092924',
                  entityTableName: 'e',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'E'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092925',
                  entityTableName: 'f',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'F'
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092926',
                  entityTableName: 'g',
                  dto: 'no',
                  pagination: 'no',
                  service: 'no',
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  name: 'G'
                }
              ];
              returnedContent = JHipsterEntityExporter.exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: ApplicationTypes.MICROSERVICE
                }
              });
            });

            it('should export every entity', () => {
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
                expect(FileUtils.doesFileExist(`.jhipster/${entityName}.json`)).to.be.true;
              });
            });

            it('should return every entity', () => {
              expect(returnedContent.length).to.be.equal(7);
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
                expect(returnedContent.filter(entity => entity.name === entityName) !== undefined).to.be.true;
              });
            });

            after(() => {
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
                fs.unlinkSync(`.jhipster/${entityName}.json`);
              });
              fs.rmdirSync('.jhipster');
            });
          });
          context('and when microservice entities are passed', () => {
            let entities;
            let returnedContent;

            before(() => {
              entities = [
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093006',
                  entityTableName: 'client',
                  dto: 'no',
                  pagination: 'no',
                  service: 'serviceClass',
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  microserviceName: 'client',
                  name: 'Client'
                },
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093007',
                  entityTableName: 'location',
                  dto: 'no',
                  pagination: 'no',
                  service: 'serviceClass',
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  microserviceName: 'client',
                  name: 'Location'
                },
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093008',
                  entityTableName: 'local_store',
                  dto: 'no',
                  pagination: 'no',
                  service: 'serviceClass',
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  microserviceName: 'store',
                  name: 'LocalStore'
                },
                {
                  fields: [[Object]],
                  relationships: [[Object]],
                  changelogDate: '20180303093009',
                  entityTableName: 'product',
                  dto: 'no',
                  pagination: 'no',
                  service: 'serviceClass',
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  clientRootFolder: '',
                  applications: '*',
                  microserviceName: 'store',
                  name: 'Product'
                }
              ];
              returnedContent = JHipsterEntityExporter.exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: ApplicationTypes.MICROSERVICE
                }
              });
            });

            it('should export the entities that should be inside the microservice', () => {
              expect(FileUtils.doesFileExist('.jhipster/Client.json'));
              expect(FileUtils.doesFileExist('.jhipster/Location.json'));
            });

            it('should return the entities that should be inside the microservice', () => {
              expect(returnedContent.length).to.be.equal(2);
            });

            after(() => {
              fs.unlinkSync('.jhipster/Client.json');
              fs.unlinkSync('.jhipster/Location.json');
              fs.rmdirSync('.jhipster');
            });
          });
        });
      });
      context('when exporting updated entities', () => {
        let originalContent;
        let newContent;
        let returnedContent;

        before(() => {
          originalContent = {
            fields: [
              {
                fieldName: 'myEnum',
                fieldType: 'MyEnum',
                fieldValues: 'FRENCH,ENGLISH'
              }
            ],
            relationships: [],
            changelogDate: '42',
            javadoc: '',
            entityTableName: 'a',
            dto: 'no',
            pagination: 'no',
            service: 'no',
            fluentMethods: true,
            jpaMetamodelFiltering: false,
            clientRootFolder: '',
            applications: []
          };
          FileUtils.createFolderIfItDoesNotExist('.jhipster');
          fs.writeFileSync(
            path.join('.jhipster', 'A.json'),
            JSON.stringify({ ...originalContent, customAttribute: '42' })
          );
          const changedContent = {
            ...JSON.parse(JSON.stringify(originalContent)),
            name: 'A',
            changelogDate: '43'
          };
          const entities = [changedContent];
          returnedContent = JHipsterEntityExporter.exportEntities({
            entities,
            application: {
              name: 'MyApp',
              type: ApplicationTypes.MONOLITH
            }
          });
          newContent = JSON.parse(fs.readFileSync(path.join('.jhipster', 'A.json'), { encoding: 'utf-8' }));
        });

        after(() => {
          fs.unlinkSync('.jhipster/A.json');
          fs.rmdirSync('.jhipster');
        });

        it('should merge the existing content with the new one', () => {
          expect(newContent).to.deep.equal({
            ...originalContent,
            name: 'A',
            customAttribute: '42'
          });
        });

        it('should keep changelogDate original value', () => {
          expect(newContent.customAttribute).to.equal('42');
        });

        it('should return the new content', () => {
          expect(newContent).to.deep.equal(returnedContent[0]);
        });
      });
    });
  });
});

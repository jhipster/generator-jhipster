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
const fs = require('fs');
const path = require('path');

const JDLMonolithApplication = require('../../../lib/core/jdl_monolith_application');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const JHipsterEntityExporter = require('../../../lib/export/jhipster_entity_exporter');
const FileUtils = require('../../../lib/utils/file_utils');

describe('JHipsterEntityExporter', () => {
  describe('::exportEntities', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          expect(() => {
            JHipsterEntityExporter.exportEntities();
          }).to.throw('Entities have to be passed to be exported.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('for only entities and a monolith app', () => {
        let entities = null;
        let aEntityContent = null;
        let returned = null;

        before(() => {
          entities = {
            A: {
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
          };
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

        it('returns the exported entities', () => {
          expect(returned).to.deep.equal([entities.A]);
        });
        it('exports the entities', () => {
          expect(aEntityContent).to.deep.equal(entities.A);
        });
      });
      context('when exporting the same entity', () => {
        let entities = null;
        let previousChangelogDate = null;
        let newChangelogDate = null;
        let returned = null;

        before(done => {
          entities = {
            A: {
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
          };
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

        it('returns the exported entities', () => {
          expect(returned).to.deep.equal([
            {
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
        it('exports it with same changelogDate', () => {
          expect(newChangelogDate).to.eq(previousChangelogDate);
        });

        after(() => {
          fs.unlinkSync('.jhipster/A.json');
          fs.rmdirSync('.jhipster');
        });
      });
      context('when passing an application name and application type', () => {
        context('inside a monolith', () => {
          let entities = null;
          let returned = null;

          before(() => {
            entities = {
              Client: {
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
              Location: {
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
              LocalStore: {
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
              Product: {
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
            };
            returned = JHipsterEntityExporter.exportEntities({
              entities,
              application: {
                name: 'client',
                type: ApplicationTypes.MONOLITH
              }
            });
          });

          it('returns the exported entities', () => {
            expect(returned).to.deep.equal([
              {
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
            let entities = null;

            before(() => {
              entities = {
                A: {
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
                  applications: '*'
                },
                B: {
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
                  applications: '*'
                },
                C: {
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
                  applications: '*'
                },
                D: {
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
                  applications: '*'
                },
                E: {
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
                  applications: '*'
                },
                F: {
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
                  applications: '*'
                },
                G: {
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
                  applications: '*'
                }
              };
              JHipsterEntityExporter.exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: ApplicationTypes.MICROSERVICE
                }
              });
            });

            it('exports every entity', () => {
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
                expect(FileUtils.doesFileExist(`.jhipster/${entityName}.json`)).to.be.true;
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
            let entities = null;

            before(() => {
              entities = {
                Client: {
                  fields: [],
                  relationships: [
                    {
                      relationshipType: 'many-to-one',
                      relationshipName: 'location',
                      otherEntityName: 'location',
                      otherEntityField: 'id'
                    }
                  ],
                  changelogDate: '20180303093006',
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
                Location: {
                  fields: [],
                  relationships: [
                    {
                      relationshipType: 'one-to-many',
                      relationshipName: 'clients',
                      otherEntityName: 'client',
                      otherEntityRelationshipName: 'location'
                    }
                  ],
                  changelogDate: '20180303093007',
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
                LocalStore: {
                  fields: [],
                  relationships: [
                    {
                      relationshipType: 'one-to-many',
                      relationshipName: 'products',
                      otherEntityName: 'product',
                      otherEntityRelationshipName: 'store'
                    }
                  ],
                  changelogDate: '20180303093008',
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
                Product: {
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
                  changelogDate: '20180303093009',
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
              };
              JHipsterEntityExporter.exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: ApplicationTypes.MICROSERVICE
                }
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
  describe('::exportEntitiesInApplications', () => {
    context('when passing invalid parameters', () => {
      context('such as undefined', () => {
        it('throws an error', () => {
          expect(() => {
            JHipsterEntityExporter.exportEntitiesInApplications();
          }).to.throw('Entities have to be passed to be exported.');
        });
      });
    });
    context('when passing valid arguments', () => {
      context('with one application', () => {
        before(() => {
          const entity = {
            fields: [],
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
            applications: ['toto']
          };
          const application = new JDLMonolithApplication({
            config: {
              baseName: 'toto'
            },
            entities: ['A']
          });
          JHipsterEntityExporter.exportEntitiesInApplications({
            entities: { A: entity },
            applications: {
              toto: application
            }
          });
        });

        after(() => {
          fs.unlinkSync(path.join('.jhipster', 'A.json'));
          fs.rmdirSync('.jhipster');
        });

        it('creates the entity in the current folder', () => {
          expect(fs.statSync('.jhipster').isDirectory()).to.be.true;
          expect(fs.statSync(path.join('.jhipster', 'A.json')).isFile()).to.be.true;
        });
      });
      context('with more than one application', () => {
        let application1 = null;
        let application2 = null;
        let entities = null;
        let aEntityContent = null;
        let bEntityContent = null;
        let returned = null;

        before(() => {
          entities = {
            A: {
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
              applications: ['toto']
            },
            B: {
              fields: [
                {
                  fieldName: 'myString',
                  fieldType: 'String'
                }
              ],
              relationships: [],
              changelogDate: '43',
              javadoc: '',
              entityTableName: 'b',
              dto: 'mapstruct',
              pagination: 'no',
              service: 'serviceClass',
              fluentMethods: true,
              jpaMetamodelFiltering: false,
              clientRootFolder: '',
              applications: ['titi']
            }
          };
          application1 = new JDLMonolithApplication({
            config: {
              baseName: 'toto'
            },
            entities: ['A']
          });
          application2 = new JDLMonolithApplication({
            config: {
              baseName: 'titi'
            },
            entities: ['B']
          });
          returned = JHipsterEntityExporter.exportEntitiesInApplications({
            entities,
            applications: {
              toto: application1,
              titi: application2
            }
          });
          aEntityContent = JSON.parse(fs.readFileSync(path.join('toto', '.jhipster', 'A.json'), { encoding: 'utf-8' }));
          bEntityContent = JSON.parse(fs.readFileSync(path.join('titi', '.jhipster', 'B.json'), { encoding: 'utf-8' }));
        });

        after(() => {
          fs.unlinkSync(path.join('toto', '.jhipster', 'A.json'));
          fs.rmdirSync(path.join('toto', '.jhipster'));
          fs.rmdirSync(path.join('toto'));
          fs.unlinkSync(path.join('titi', '.jhipster', 'B.json'));
          fs.rmdirSync(path.join('titi', '.jhipster'));
          fs.rmdirSync(path.join('titi'));
        });

        it('returns the exported entities', () => {
          expect(returned).to.deep.equal([entities.A, entities.B]);
        });
        it('exports the entities', () => {
          expect(aEntityContent).to.deep.equal(entities.A);
          expect(bEntityContent).to.deep.equal(entities.B);
        });
      });
    });
  });
});

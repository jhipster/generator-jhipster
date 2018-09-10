/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const JDLImporter = require('../../../lib/jdl/jdl_importer');

describe('JDLImporter', () => {
  describe('::new', () => {
    context('when not passing files', () => {
      it('fails', () => {
        expect(() => {
          new JDLImporter();
        }).to.throw('JDL files must be passed so as to be imported.');
      });
    });
  });
  describe('#import', () => {
    context('when not parsing applications', () => {
      const ENTITY_NAMES = ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'];
      let filesExist = true;
      let returned = null;
      const expectedContent = {
        Country: {
          fields: [
            {
              fieldName: 'name',
              fieldType: 'String'
            }
          ],
          relationships: [
            {
              relationshipName: 'location',
              otherEntityName: 'location',
              relationshipType: 'many-to-one',
              otherEntityField: 'id'
            },
            {
              relationshipType: 'one-to-many',
              relationshipName: 'region',
              otherEntityName: 'region',
              otherEntityRelationshipName: 'country'
            }
          ],
          name: 'Country',
          entityTableName: 'country',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          skipServer: true,
          microserviceName: 'mymicroservice',
          javadoc: ''
        },
        Department: {
          fields: [
            {
              fieldName: 'name',
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
          ],
          relationships: [
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
          ],
          name: 'Department',
          entityTableName: 'department',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: ''
        },
        Employee: {
          fields: [
            {
              fieldName: 'firstName',
              javadoc: 'The firstname attribute.',
              fieldType: 'String'
            },
            {
              fieldName: 'lastName',
              fieldType: 'String'
            },
            {
              fieldName: 'email',
              fieldType: 'String'
            },
            {
              fieldName: 'phoneNumber',
              fieldType: 'String'
            },
            {
              fieldName: 'hireDate',
              fieldType: 'ZonedDateTime'
            },
            {
              fieldName: 'salary',
              fieldType: 'Long'
            },
            {
              fieldName: 'commissionPct',
              fieldType: 'Long'
            }
          ],
          relationships: [
            {
              relationshipType: 'one-to-many',
              relationshipName: 'job',
              otherEntityName: 'job',
              otherEntityRelationshipName: 'employee'
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'user',
              otherEntityName: 'user',
              otherEntityField: 'login'
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'manager',
              otherEntityName: 'employee',
              otherEntityField: 'id'
            },
            {
              relationshipType: 'many-to-one',
              javadoc: 'Another side of the same relationship,',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityField: 'id'
            }
          ],
          name: 'Employee',
          javadoc: 'The Employee entity.\nSecond line in javadoc.',
          entityTableName: 'employee',
          dto: 'mapstruct',
          pagination: 'infinite-scroll',
          service: 'serviceClass',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          searchEngine: 'elasticsearch'
        },
        Job: {
          fields: [
            {
              fieldName: 'title',
              fieldType: 'String',
              fieldValidateRules: ['minlength', 'maxlength'],
              fieldValidateRulesMinlength: 5,
              fieldValidateRulesMaxlength: 25
            },
            {
              fieldName: 'type',
              fieldType: 'JobType',
              fieldValues: 'BOSS,SLAVE'
            },
            {
              fieldName: 'minSalary',
              fieldType: 'Long'
            },
            {
              fieldName: 'maxSalary',
              fieldType: 'Long'
            }
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'job',
              relationshipName: 'chore',
              otherEntityName: 'task',
              otherEntityField: 'title',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'employee',
              otherEntityName: 'employee',
              otherEntityField: 'id'
            }
          ],
          name: 'Job',
          entityTableName: 'job',
          dto: 'no',
          pagination: 'pagination',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: ''
        },
        JobHistory: {
          fields: [
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
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: '',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityField: 'id',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: '',
              relationshipName: 'department',
              otherEntityName: 'job',
              otherEntityField: 'id',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: '',
              relationshipName: 'employee',
              otherEntityName: 'employee',
              otherEntityField: 'id',
              ownerSide: true
            }
          ],
          name: 'JobHistory',
          javadoc: 'JobHistory comment.',
          entityTableName: 'job_history',
          dto: 'no',
          pagination: 'infinite-scroll',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice'
        },
        Location: {
          fields: [
            {
              fieldName: 'streetAddress',
              fieldType: 'String'
            },
            {
              fieldName: 'postalCode',
              fieldType: 'String'
            },
            {
              fieldName: 'city',
              fieldType: 'String'
            },
            {
              fieldName: 'stateProvince',
              fieldType: 'String'
            }
          ],
          relationships: [
            {
              relationshipType: 'one-to-many',
              relationshipName: 'country',
              otherEntityName: 'country',
              otherEntityRelationshipName: 'location'
            }
          ],
          name: 'Location',
          entityTableName: 'location',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: ''
        },
        Region: {
          fields: [
            {
              fieldName: 'name',
              fieldType: 'String'
            }
          ],
          relationships: [
            {
              relationshipName: 'country',
              otherEntityName: 'country',
              relationshipType: 'many-to-one',
              otherEntityField: 'id'
            }
          ],
          name: 'Region',
          entityTableName: 'region',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: ''
        },
        Task: {
          fields: [
            {
              fieldName: 'title',
              fieldType: 'String'
            },
            {
              fieldName: 'description',
              fieldType: 'String'
            }
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              relationshipName: 'job',
              otherEntityName: 'job',
              ownerSide: false,
              otherEntityRelationshipName: 'chore'
            }
          ],
          name: 'Task',
          entityTableName: 'task',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: ''
        }
      };

      before(() => {
        const importer = new JDLImporter([path.join('test', 'test_files', 'big_sample.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL
        });
        returned = importer.import();
        returned.exportedEntities = returned.exportedEntities
          .sort((exportedEntityA, exportedEntityB) => {
            if (exportedEntityA.entityTableName < exportedEntityB.entityTableName) {
              return -1;
            }
            return 1;
          })
          .map(exportedEntity => {
            exportedEntity.javadoc = exportedEntity.javadoc || '';
            delete exportedEntity.changelogDate;
            return exportedEntity;
          });
        filesExist = ENTITY_NAMES.reduce(
          (result, entityName) => result && fs.statSync(path.join('.jhipster', `${entityName}.json`)).isFile()
        );
      });

      after(() => {
        ENTITY_NAMES.forEach(entityName => {
          fs.unlinkSync(path.join('.jhipster', `${entityName}.json`));
        });
        fs.rmdirSync('.jhipster');
      });

      it('returns the final state', () => {
        expect(returned).to.deep.equal({
          exportedEntities: [
            expectedContent.Country,
            expectedContent.Department,
            expectedContent.Employee,
            expectedContent.Job,
            expectedContent.JobHistory,
            expectedContent.Location,
            expectedContent.Region,
            expectedContent.Task
          ],
          exportedApplications: []
        });
      });
      it('creates the files', () => {
        expect(filesExist).to.be.true;
      });
      it('exports their content', () => {
        ENTITY_NAMES.forEach(entityName => {
          const entityContent = JSON.parse(fs.readFileSync(path.join('.jhipster', `${entityName}.json`), 'utf-8'));
          expect(entityContent.changelogDate).not.to.be.undefined;
          delete entityContent.changelogDate;
          if (expectedContent[entityName].javadoc === '') {
            delete expectedContent[entityName].javadoc;
          }
          expect(entityContent).to.deep.equal(expectedContent[entityName]);
        });
      });
    });
    context('when parsing one JDL application and entities', () => {
      let returned = null;

      before(() => {
        const importer = new JDLImporter([path.join('test', 'test_files', 'application_with_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        fs.unlinkSync(path.join('.jhipster', 'BankAccount.json'));
        fs.unlinkSync('.yo-rc.json');
        fs.rmdirSync('.jhipster');
      });

      it('returns the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });
      it('creates the app config file in the same folder', () => {
        expect(fs.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('creates the entity folder in the same folder', () => {
        expect(fs.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fs.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
    });
    context('when parsing JDL applications and exporting them', () => {
      const contents = [];
      const expectedContents = [
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'tata',
            packageName: 'com.mathieu.tata',
            packageFolder: 'com/mathieu/tata',
            authenticationType: 'jwt',
            websocket: false,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        },
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'titi',
            packageName: 'com.mathieu.titi',
            packageFolder: 'com/mathieu/titi',
            authenticationType: 'jwt',
            websocket: false,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'gateway',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        },
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'toto',
            packageName: 'com.mathieu.toto',
            packageFolder: 'com/mathieu/toto',
            authenticationType: 'jwt',
            websocket: false,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'microservice',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8081',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            cacheProvider: 'hazelcast',
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: true,
            skipServer: false
          }
        },
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'tutu',
            packageName: 'com.mathieu.tutu',
            packageFolder: 'com/mathieu/tutu',
            authenticationType: 'jwt',
            websocket: false,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        }
      ];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = new JDLImporter([path.join('test', 'test_files', 'applications2.jdl')]);
        importer.import();
        APPLICATION_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fs.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fs.unlinkSync(path.join(applicationName, '.yo-rc.json'));
          fs.rmdirSync(applicationName);
        });
      });

      it('creates the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fs.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fs.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('exports the application contents', () => {
        contents.forEach(content => {
          expect(content['generator-jhipster'].jwtSecretKey).not.to.be.undefined;
          delete content['generator-jhipster'].jwtSecretKey;
        });
        expect(contents).to.deep.equal(expectedContents);
      });
    });
    context('when parsing multiple JDL files with applications and entities', () => {
      const APPLICATION_NAMES = ['myFirstApp', 'mySecondApp', 'myThirdApp'];
      const ENTITY_NAMES = ['A', 'B', 'E', 'F']; // C & D don't get to be generated
      const expectedApplications = [
        {
          entities: ['A', 'B', 'E', 'F'],
          'generator-jhipster': {
            baseName: 'myFirstApp',
            packageName: 'com.mycompany.myfirstapp',
            packageFolder: 'com/mycompany/myfirstapp',
            authenticationType: 'jwt',
            websocket: false,
            enableHibernateCache: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        },
        {
          entities: ['E'],
          'generator-jhipster': {
            baseName: 'mySecondApp',
            packageName: 'com.mycompany.myapp',
            packageFolder: 'com/mycompany/myapp',
            authenticationType: 'jwt',
            websocket: false,
            enableHibernateCache: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'microservice',
            cacheProvider: 'hazelcast',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8091',
            enableSwaggerCodegen: false,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: true,
            skipServer: false
          }
        },
        {
          entities: ['F'],
          'generator-jhipster': {
            baseName: 'myThirdApp',
            packageName: 'com.mycompany.myapp',
            packageFolder: 'com/mycompany/myapp',
            authenticationType: 'jwt',
            websocket: false,
            enableHibernateCache: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'microservice',
            cacheProvider: 'hazelcast',
            testFrameworks: [],
            languages: ['en', 'fr'],
            serverPort: '8092',
            enableSwaggerCodegen: false,
            useSass: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: true,
            skipServer: false
          }
        }
      ];
      const expectedEntities = [
        {
          name: 'A',
          fields: [],
          relationships: [],
          entityTableName: 'a',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: ['myFirstApp']
        },
        {
          name: 'B',
          fields: [],
          relationships: [],
          entityTableName: 'b',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: ['myFirstApp']
        },
        {
          name: 'E',
          fields: [],
          relationships: [],
          entityTableName: 'e',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: ['myFirstApp', 'mySecondApp'],
          microserviceName: 'mySecondApp'
        },
        {
          name: 'F',
          fields: [],
          relationships: [],
          entityTableName: 'f',
          dto: 'no',
          pagination: 'no',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: ['myFirstApp', 'myThirdApp']
        }
      ];

      before(() => {
        const importer = new JDLImporter([
          path.join('test', 'test_files', 'integration', 'file1.jdl'),
          path.join('test', 'test_files', 'integration', 'file2.jdl')
        ]);
        importer.import();
      });

      after(() => {
        fs.unlinkSync(path.join('myFirstApp', '.jhipster', 'A.json'));
        fs.unlinkSync(path.join('myFirstApp', '.jhipster', 'B.json'));
        fs.unlinkSync(path.join('myFirstApp', '.jhipster', 'E.json'));
        fs.unlinkSync(path.join('myFirstApp', '.jhipster', 'F.json'));
        fs.unlinkSync(path.join('mySecondApp', '.jhipster', 'E.json'));
        fs.unlinkSync(path.join('myThirdApp', '.jhipster', 'F.json'));
        APPLICATION_NAMES.forEach(applicationName => {
          fs.unlinkSync(path.join(applicationName, '.yo-rc.json'));
          fs.rmdirSync(path.join(applicationName, '.jhipster'));
          fs.rmdirSync(path.join(applicationName));
        });
      });

      it('exports the applications', () => {
        APPLICATION_NAMES.forEach((applicationName, index) => {
          expect(fs.statSync(path.join(applicationName)).isDirectory()).to.be.true;
          const appConfPath = path.join(applicationName, '.yo-rc.json');
          expect(fs.statSync(appConfPath).isFile()).to.be.true;
          const readJSON = JSON.parse(fs.readFileSync(appConfPath, 'utf-8').toString());
          expect(readJSON['generator-jhipster'].jwtSecretKey).not.to.be.undefined;
          delete readJSON['generator-jhipster'].jwtSecretKey;
          expect(readJSON).to.deep.equal(expectedApplications[index]);
        });
      });
      it('exports the entities for each application', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          let readJSON = null;
          expect(fs.statSync(path.join(applicationName, '.jhipster')).isDirectory()).to.be.true;
          switch (applicationName) {
            case 'myFirstApp': // A, B, E, F
              ENTITY_NAMES.forEach((entityName, index) => {
                readJSON = JSON.parse(
                  fs.readFileSync(path.join(applicationName, '.jhipster', `${entityName}.json`), 'utf-8').toString()
                );
                expect(readJSON.changelogDate).not.to.be.undefined;
                delete readJSON.changelogDate;
                expect(readJSON).to.deep.equal(expectedEntities[index]);
              });
              break;
            case 'mySecondApp': // only E
              readJSON = JSON.parse(
                fs.readFileSync(path.join(applicationName, '.jhipster', 'E.json'), 'utf-8').toString()
              );
              expect(readJSON.changelogDate).not.to.be.undefined;
              delete readJSON.changelogDate;
              expect(readJSON).to.deep.equal(expectedEntities[2]);
              break;
            case 'myThirdApp': // only F
              readJSON = JSON.parse(
                fs.readFileSync(path.join(applicationName, '.jhipster', 'F.json'), 'utf-8').toString()
              );
              expect(readJSON.changelogDate).not.to.be.undefined;
              delete readJSON.changelogDate;
              expect(readJSON).to.deep.equal(expectedEntities[3]);
              break;
            default:
            // nothing to do
          }
        });
      });
    });
    context("when choosing 'no' as database type", () => {
      let importer = null;

      before("importing a JDL file with the 'no' database type", () => {
        importer = new JDLImporter([path.join('test', 'test_files', 'simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.NO
        });
      });

      after(() => {
        fs.unlinkSync(path.join('.jhipster', 'A.json'));
        fs.unlinkSync(path.join('.jhipster', 'B.json'));
        fs.rmdirSync('.jhipster');
      });

      it('does not fail', () => {
        importer.import();
      });
    });
    context('when parsing a JDL with annotations', () => {
      let returned = null;

      before(() => {
        const importer = new JDLImporter([path.join('test', 'test_files', 'annotations.jdl')], {
          databaseType: DatabaseTypes.SQL
        });
        returned = importer.import();
      });

      after(() => {
        fs.unlinkSync(path.join('.jhipster', 'A.json'));
        fs.unlinkSync(path.join('.jhipster', 'B.json'));
        fs.unlinkSync(path.join('.jhipster', 'C.json'));
        fs.rmdirSync('.jhipster');
      });

      it('sets the options', () => {
        expect(returned.exportedEntities[0].service).to.equal('serviceClass');
        expect(returned.exportedEntities[0].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[0].skipClient).to.equal(true);
        expect(returned.exportedEntities[1].pagination).to.equal('pager');
        expect(returned.exportedEntities[1].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[1].service).to.equal('serviceClass');
        expect(returned.exportedEntities[2].skipClient).to.equal(true);
        expect(returned.exportedEntities[2].jpaMetamodelFiltering).to.equal(true);
        expect(returned.exportedEntities[2].pagination).to.equal('pager');
      });
    });
  });
});

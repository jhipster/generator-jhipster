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
const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');

const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const { createImporterFromFiles, createImporterFromContent } = require('../../../lib/jdl/jdl_importer');

describe('JDLImporter', () => {
  describe('createImporterFromFiles', () => {
    context('when not passing files', () => {
      it('should fail', () => {
        expect(() => createImporterFromFiles()).to.throw(/^Files must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('createImporterFromContent', () => {
    context('when not passing any content', () => {
      it('should fail', () => {
        expect(() => createImporterFromContent()).to.throw(
          /^A JDL content must be passed to create a new JDL importer\.$/
        );
      });
    });
  });
  describe('import', () => {
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
              relationshipType: 'one-to-many',
              relationshipName: 'area',
              otherEntityName: 'region',
              otherEntityRelationshipName: 'country'
            },
            {
              relationshipName: 'location',
              otherEntityName: 'location',
              relationshipType: 'many-to-one',
              otherEntityField: 'id',
              otherEntityRelationshipName: 'country'
            }
          ],
          name: 'Country',
          entityTableName: 'country',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
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
            },
            {
              otherEntityField: 'id',
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'department',
              ownerSide: false,
              relationshipName: 'jobHistory',
              relationshipType: 'many-to-many'
            }
          ],
          name: 'Department',
          entityTableName: 'department',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
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
              otherEntityRelationshipName: 'emp'
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'user',
              otherEntityName: 'user',
              otherEntityField: 'login',
              otherEntityRelationshipName: 'employee'
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'manager',
              otherEntityName: 'employee',
              otherEntityField: 'lastName',
              otherEntityRelationshipName: 'employee'
            },
            {
              relationshipType: 'many-to-one',
              javadoc: 'Another side of the same relationship,',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityRelationshipName: 'employee',
              otherEntityField: 'id'
            },
            {
              otherEntityField: 'id',
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'emp',
              ownerSide: false,
              relationshipName: 'jobHistory',
              relationshipType: 'many-to-many'
            }
          ],
          name: 'Employee',
          javadoc: 'The Employee entity.\\nSecond line in javadoc.',
          entityTableName: 'employee',
          dto: 'mapstruct',
          pagination: 'infinite-scroll',
          readOnly: false,
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
              otherEntityRelationshipName: 'linkedJob',
              relationshipName: 'chore',
              otherEntityName: 'task',
              otherEntityField: 'title',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'emp',
              otherEntityName: 'employee',
              otherEntityRelationshipName: 'job',
              otherEntityField: 'employee'
            },
            {
              relationshipType: 'many-to-many',
              relationshipName: 'history',
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'job',
              otherEntityField: 'id',
              ownerSide: false
            }
          ],
          name: 'Job',
          entityTableName: 'job',
          dto: 'no',
          pagination: 'pagination',
          readOnly: false,
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
            },
            {
              fieldName: 'positionDuration',
              fieldType: 'Duration'
            }
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'jobHistory',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityField: 'id',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'history',
              relationshipName: 'job',
              otherEntityName: 'job',
              otherEntityField: 'id',
              ownerSide: true
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'jobHistory',
              relationshipName: 'emp',
              otherEntityName: 'employee',
              otherEntityField: 'employee',
              ownerSide: true
            }
          ],
          name: 'JobHistory',
          javadoc: 'JobHistory comment.',
          entityTableName: 'job_history',
          dto: 'no',
          readOnly: true,
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
          readOnly: false,
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
              otherEntityRelationshipName: 'area',
              relationshipType: 'many-to-one',
              otherEntityField: 'id'
            }
          ],
          name: 'Region',
          entityTableName: 'region',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
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
              relationshipName: 'linkedJob',
              otherEntityName: 'job',
              ownerSide: false,
              otherEntityField: 'jobTitle',
              otherEntityRelationshipName: 'chore'
            }
          ],
          name: 'Task',
          entityTableName: 'task',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
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
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'big_sample.jdl')], {
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
          (result, entityName) => result && fse.statSync(path.join('.jhipster', `${entityName}.json`)).isFile()
        );
      });

      after(() => {
        fse.removeSync('.jhipster');
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
          exportedApplications: [],
          exportedDeployments: []
        });
      });
      it('creates the files', () => {
        expect(filesExist).to.be.true;
      });
      it('exports their content', () => {
        ENTITY_NAMES.forEach(entityName => {
          const entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', `${entityName}.json`), 'utf-8'));
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
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'application_with_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('returns the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('creates the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('creates the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
    });
    context('when parsing one JDL application and entities passed as string', () => {
      let returned = null;

      before(() => {
        const importer = createImporterFromContent(
          `application {
            config {
              baseName MyApp
              applicationType microservice
              jwtSecretKey aaa.bbb.ccc
            }
            entities * except Customer
          }

          entity BankAccount
          entity Customer
          `,
          {}
        );
        returned = importer.import();
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('returns the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('creates the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('creates the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
    });
    context('when parsing one JDL application and entities with entity and dto suffixes', () => {
      let returned = null;
      let content = null;

      before(() => {
        const importer = createImporterFromFiles([
          path.join('test', 'test_files', 'application_with_entity_dto_suffixes.jdl')
        ]);
        returned = importer.import();

        content = JSON.parse(fse.readFileSync('.yo-rc.json', 'utf-8'));
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('returns the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });
      it('creates the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
        expect(content['generator-jhipster'].entitySuffix).to.equal('Entity');
        expect(content['generator-jhipster'].dtoSuffix).to.equal('');
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
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
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            nativeLanguage: 'en',
            skipUserManagement: true,
            skipClient: true
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        }
      ];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'applications2.jdl')]);
        importer.import();
        APPLICATION_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('creates the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('exports the application contents', () => {
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'yeti',
            clientThemeVariant: 'primary',
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
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            nativeLanguage: 'en',
            skipUserManagement: true,
            skipClient: true
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
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            nativeLanguage: 'en',
            skipUserManagement: true,
            skipClient: true
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
          readOnly: false,
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
          readOnly: false,
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
          readOnly: false,
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
          readOnly: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          clientRootFolder: '',
          applications: ['myFirstApp', 'myThirdApp']
        }
      ];
      let importState;
      before(() => {
        const importer = createImporterFromFiles([
          path.join('test', 'test_files', 'integration', 'file1.jdl'),
          path.join('test', 'test_files', 'integration', 'file2.jdl')
        ]);
        importState = importer.import();
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(path.join(applicationName));
        });
      });

      it('generates correct import state', () => {
        expect(importState.exportedApplications.length).to.eql(3);
        expect(importState.exportedEntities.length).to.eql(4);
      });

      it('exports the applications', () => {
        APPLICATION_NAMES.forEach((applicationName, index) => {
          expect(fse.statSync(path.join(applicationName)).isDirectory()).to.be.true;
          const appConfPath = path.join(applicationName, '.yo-rc.json');
          expect(fse.statSync(appConfPath).isFile()).to.be.true;
          const readJSON = JSON.parse(fse.readFileSync(appConfPath, 'utf-8').toString());
          expect(readJSON).to.deep.equal(expectedApplications[index]);
        });
      });
      it('exports the entities for each application', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          let readJSON = null;
          expect(fse.statSync(path.join(applicationName, '.jhipster')).isDirectory()).to.be.true;
          switch (applicationName) {
            case 'myFirstApp': // A, B, E, F
              ENTITY_NAMES.forEach((entityName, index) => {
                readJSON = JSON.parse(
                  fse.readFileSync(path.join(applicationName, '.jhipster', `${entityName}.json`), 'utf-8').toString()
                );
                expect(readJSON.changelogDate).not.to.be.undefined;
                delete readJSON.changelogDate;
                expect(readJSON).to.deep.equal(expectedEntities[index]);
              });
              break;
            case 'mySecondApp': // only E
              readJSON = JSON.parse(
                fse.readFileSync(path.join(applicationName, '.jhipster', 'E.json'), 'utf-8').toString()
              );
              expect(readJSON.changelogDate).not.to.be.undefined;
              delete readJSON.changelogDate;
              expect(readJSON).to.deep.equal(expectedEntities[2]);
              break;
            case 'myThirdApp': // only F
              readJSON = JSON.parse(
                fse.readFileSync(path.join(applicationName, '.jhipster', 'F.json'), 'utf-8').toString()
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
        importer = createImporterFromFiles([path.join('test', 'test_files', 'simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.NO
        });
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('does not fail', () => {
        importer.import();
      });
    });
    context('when parsing a JDL with annotations', () => {
      let returned = null;

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'annotations.jdl')], {
          databaseType: DatabaseTypes.SQL
        });
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('sets the options', () => {
        expect(returned.exportedEntities[0].service).to.equal('serviceClass');
        expect(returned.exportedEntities[0].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[0].skipClient).to.equal(true);
        expect(returned.exportedEntities[0].myCustomUnaryOption).to.equal(true);
        expect(returned.exportedEntities[0].myCustomBinaryOption).to.equal('customValue');
        expect(returned.exportedEntities[1].pagination).to.equal('pagination');
        expect(returned.exportedEntities[1].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[1].service).to.equal('serviceClass');
        expect(returned.exportedEntities[2].skipClient).to.equal(true);
        expect(returned.exportedEntities[2].jpaMetamodelFiltering).to.equal(true);
        expect(returned.exportedEntities[2].pagination).to.equal('pagination');
        expect(returned.exportedEntities[2].myCustomBinaryOption).to.equal('customValue2');
        expect(returned.exportedEntities[0].fields[0].options.id).to.equal(true);
        expect(returned.exportedEntities[0].fields[0].options.multiValue).to.deep.equal(['value1', 'value2', 'value3']);
      });
    });
    context('when parsing a JDL with a pattern validation', () => {
      let returned = null;
      let entityContent;

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'regex_validation.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL
        });
        returned = importer.import();
        entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', 'Customer.json'), { encoding: 'utf8' }));
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the back-slash in the returned object', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern).to.equal(
          '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
        );
      });
      it('escapes the back-slash in the written entity file', () => {
        expect(entityContent.fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
    });
    context('when parsing a JDL with a pattern validation containing a quote', () => {
      let returned = null;

      before(() => {
        const importer = createImporterFromFiles(
          [path.join('test', 'test_files', 'pattern_validation_with_quote.jdl')],
          {
            applicationName: 'MyApp',
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL
          }
        );
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the quote', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern.includes("\\'")).to.be.true;
      });
    });
    context('when parsing a JDL with underscores contained in the application name', () => {
      let returned = null;

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'underscore_application_name.jdl')]);
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
        fse.removeSync('.yo-rc.json');
      });

      it('accept underscore application name', () => {
        expect(returned.exportedApplications[0]['generator-jhipster'].baseName.includes('_')).to.be.true;
      });

      it('accept underscore appsFolders name', () => {
        expect(returned.exportedDeployments[0]['generator-jhipster'].appsFolders[0].includes('_')).to.be.true;
      });
    });
    context('when parsing JDL applications and deployment config', () => {
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
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
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            nativeLanguage: 'en',
            skipUserManagement: true,
            skipClient: true
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
            useSass: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            nativeLanguage: 'en',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false
          }
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            directoryPath: '../',
            gatewayType: 'zuul',
            clusteredDbApps: [],
            consoleOptions: [],
            deploymentType: 'docker-compose',
            serviceDiscoveryType: 'eureka',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            monitoring: 'no'
          }
        }
      ];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'applications3.jdl')]);
        importer.import();
        APPLICATION_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
        contents.push(JSON.parse(fse.readFileSync(path.join('docker-compose', '.yo-rc.json'), 'utf-8')));
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
        fse.removeSync('docker-compose');
      });

      it('creates the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('creates the docker-compose folder with .yo-rc.json file', () => {
        expect(fse.statSync(path.join('docker-compose', '.yo-rc.json')).isFile()).to.be.true;
        expect(fse.statSync('docker-compose').isDirectory()).to.be.true;
      });
      it('exports the application & deployment contents', () => {
        expect(contents).to.deep.equal(expectedContents);
      });
    });
    context('when parsing deployment config', () => {
      const contents = [];
      const expectedContents = [
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            directoryPath: '../',
            gatewayType: 'zuul',
            clusteredDbApps: [],
            consoleOptions: [],
            deploymentType: 'docker-compose',
            serviceDiscoveryType: 'eureka',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            monitoring: 'no'
          }
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            clusteredDbApps: [],
            consoleOptions: [],
            directoryPath: '../',
            deploymentType: 'kubernetes',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            gatewayType: 'zuul',
            ingressDomain: '',
            istio: false,
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka'
          }
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            clusteredDbApps: [],
            consoleOptions: [],
            directoryPath: '../',
            deploymentType: 'openshift',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            gatewayType: 'zuul',
            monitoring: 'no',
            openshiftNamespace: 'default',
            serviceDiscoveryType: 'eureka',
            storageType: 'ephemeral'
          }
        }
      ];
      const DEPLOYMENT_NAMES = ['docker-compose', 'kubernetes', 'openshift'];

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'deployments.jdl')]);
        importer.import();
        DEPLOYMENT_NAMES.forEach(name => {
          contents.push(JSON.parse(fse.readFileSync(path.join(name, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        DEPLOYMENT_NAMES.forEach(name => {
          fse.removeSync(name);
        });
      });

      it('creates the folders and the .yo-rc.json files', () => {
        DEPLOYMENT_NAMES.forEach(name => {
          expect(fse.statSync(path.join(name, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(name).isDirectory()).to.be.true;
        });
      });
      it('exports the deployment contents', () => {
        expect(contents).to.deep.equal(expectedContents);
      });
    });
    context('when parsing JDL applications and deployment config with a realistic sample', () => {
      const contents = [];
      const expectedContents = [
        {
          'generator-jhipster': {
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: ['en', 'fr'],
            messageBroker: false,
            nativeLanguage: 'en',
            packageName: 'com.jhipster.demo.store',
            packageFolder: 'com/jhipster/demo/store',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: false,
            skipServer: false,
            testFrameworks: ['protractor'],
            websocket: false,
            baseName: 'store',
            applicationType: 'gateway',
            authenticationType: 'jwt',
            cacheProvider: 'hazelcast',
            buildTool: 'gradle',
            clientFramework: 'react',
            clientTheme: 'none',
            clientThemeVariant: '',
            useSass: true,
            skipUserManagement: false,
            clientPackageManager: 'npm',
            serverPort: '8080'
          },
          entities: [
            'Customer',
            'Product',
            'ProductCategory',
            'ProductOrder',
            'OrderItem',
            'Invoice',
            'Shipment',
            'Notification'
          ]
        },
        {
          'generator-jhipster': {
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: ['en', 'fr'],
            messageBroker: false,
            nativeLanguage: 'en',
            packageName: 'com.jhipster.demo.product',
            packageFolder: 'com/jhipster/demo/product',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: true,
            testFrameworks: [],
            websocket: false,
            baseName: 'product',
            applicationType: 'microservice',
            authenticationType: 'jwt',
            cacheProvider: 'hazelcast',
            buildTool: 'gradle',
            serverPort: '8081',
            skipUserManagement: true,
            clientPackageManager: 'npm'
          },
          entities: ['Product', 'ProductCategory', 'ProductOrder', 'OrderItem']
        },
        {
          'generator-jhipster': {
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: ['en', 'fr'],
            messageBroker: false,
            nativeLanguage: 'en',
            packageName: 'com.jhipster.demo.invoice',
            packageFolder: 'com/jhipster/demo/invoice',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: true,
            testFrameworks: [],
            websocket: false,
            baseName: 'invoice',
            applicationType: 'microservice',
            authenticationType: 'jwt',
            buildTool: 'gradle',
            serverPort: '8082',
            skipUserManagement: true,
            clientPackageManager: 'npm',
            cacheProvider: 'hazelcast'
          },
          entities: ['Invoice', 'Shipment']
        },
        {
          'generator-jhipster': {
            databaseType: 'mongodb',
            devDatabaseType: 'mongodb',
            enableHibernateCache: false,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: ['en', 'fr'],
            messageBroker: false,
            nativeLanguage: 'en',
            packageName: 'com.jhipster.demo.notification',
            packageFolder: 'com/jhipster/demo/notification',
            prodDatabaseType: 'mongodb',
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: true,
            testFrameworks: [],
            websocket: false,
            baseName: 'notification',
            applicationType: 'microservice',
            authenticationType: 'jwt',
            cacheProvider: 'no',
            buildTool: 'gradle',
            serverPort: '8083',
            skipUserManagement: true,
            clientPackageManager: 'npm'
          },
          entities: ['Notification']
        },
        {
          'generator-jhipster': {
            deploymentType: 'docker-compose',
            gatewayType: 'zuul',
            monitoring: 'no',
            directoryPath: '../',
            appsFolders: ['store', 'invoice', 'notification', 'product'],
            clusteredDbApps: [],
            consoleOptions: [],
            serviceDiscoveryType: false,
            dockerRepositoryName: 'deepu105',
            dockerPushCommand: 'docker push'
          }
        },
        {
          'generator-jhipster': {
            deploymentType: 'kubernetes',
            gatewayType: 'zuul',
            monitoring: 'no',
            directoryPath: '../',
            appsFolders: ['store', 'invoice', 'notification', 'product'],
            clusteredDbApps: [],
            consoleOptions: [],
            serviceDiscoveryType: false,
            dockerRepositoryName: 'deepu105',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
            ingressDomain: '',
            istio: false
          }
        }
      ];
      const FOLDER_NAMES = ['store', 'product', 'invoice', 'notification', 'docker-compose', 'kubernetes'];

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'realistic_sample.jdl')]);
        importer.import();
        FOLDER_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        FOLDER_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('creates the folders and the .yo-rc.json files', () => {
        FOLDER_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('exports the application & deployment contents', () => {
        expect(contents).to.deep.equal(expectedContents);
      });
    });
    context('when parsing entities and enums with custom values', () => {
      let exported;

      before(() => {
        const importer = createImporterFromFiles([path.join('test', 'test_files', 'enum_with_values.jdl')], {
          applicationName: 'toto',
          applicationType: 'monolith',
          databaseType: 'sql',
          generatorVersion: '6.4.1'
        });
        importer.import();
        exported = JSON.parse(fse.readFileSync(path.join('.jhipster', 'Environment.json'), 'utf-8'));
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should export them', () => {
        expect(exported.fields[0].fieldValues).to.equal(
          'ARCHIVE (archive),DEV (development),INTEGRATION (integration),PROD (production),TEST (test),UAT (uat),NON_PROD (nonProd)'
        );
      });
    });
  });
});

/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');

const ApplicationTypes = require('../../jdl/jhipster/application-types');
const DatabaseTypes = require('../../jdl/jhipster/database-types');
const { createImporterFromFiles, createImporterFromContent } = require('../../jdl/jdl-importer');

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
        expect(() => createImporterFromContent()).to.throw(/^A JDL content must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('import', () => {
    context('when not parsing applications', () => {
      const ENTITY_NAMES = ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'];
      let filesExist = true;
      let returned;
      const expectedContent = {
        Country: {
          fields: [
            {
              fieldName: 'name',
              fieldType: 'String',
            },
          ],
          relationships: [
            {
              otherEntityField: 'region',
              relationshipType: 'one-to-many',
              relationshipName: 'area',
              otherEntityName: 'region',
              otherEntityRelationshipName: 'country',
            },
            {
              relationshipName: 'location',
              otherEntityName: 'location',
              relationshipType: 'many-to-one',
              otherEntityRelationshipName: 'country',
            },
          ],
          name: 'Country',
          entityTableName: 'country',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          skipServer: true,
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
        Department: {
          fields: [
            {
              fieldName: 'name',
              fieldType: 'String',
              fieldValidateRules: ['required'],
            },
            {
              fieldName: 'description',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'text',
            },
            {
              fieldName: 'advertisement',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'any',
            },
            {
              fieldName: 'logo',
              fieldType: 'byte[]',
              fieldTypeBlobContent: 'image',
            },
          ],
          relationships: [
            {
              options: {
                id: '42',
              },
              relationshipType: 'one-to-one',
              relationshipName: 'location',
              otherEntityName: 'location',
              ownerSide: true,
              otherEntityRelationshipName: 'department',
            },
            {
              relationshipType: 'one-to-many',
              javadoc: 'A relationship',
              relationshipName: 'employee',
              otherEntityName: 'employee',
              otherEntityRelationshipName: 'department',
            },
            {
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'department',
              ownerSide: false,
              relationshipName: 'jobHistory',
              relationshipType: 'many-to-many',
            },
          ],
          name: 'Department',
          entityTableName: 'department',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: true,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
        Employee: {
          fields: [
            {
              fieldName: 'firstName',
              javadoc: 'The firstname attribute.',
              fieldType: 'String',
            },
            {
              fieldName: 'lastName',
              fieldType: 'String',
            },
            {
              fieldName: 'email',
              fieldType: 'String',
            },
            {
              fieldName: 'phoneNumber',
              fieldType: 'String',
            },
            {
              fieldName: 'hireDate',
              fieldType: 'ZonedDateTime',
            },
            {
              fieldName: 'salary',
              fieldType: 'Long',
            },
            {
              fieldName: 'commissionPct',
              fieldType: 'Long',
            },
          ],
          relationships: [
            {
              relationshipType: 'one-to-many',
              relationshipName: 'job',
              otherEntityName: 'job',
              otherEntityRelationshipName: 'emp',
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'user',
              otherEntityName: 'user',
              otherEntityField: 'login',
              otherEntityRelationshipName: 'employee',
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'manager',
              otherEntityName: 'employee',
              otherEntityField: 'lastName',
              otherEntityRelationshipName: 'employee',
            },
            {
              relationshipType: 'many-to-one',
              javadoc: 'Another side of the same relationship,',
              relationshipName: 'department',
              otherEntityName: 'department',
              otherEntityRelationshipName: 'employee',
            },
            {
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'emp',
              ownerSide: false,
              relationshipName: 'jobHistory',
              relationshipType: 'many-to-many',
            },
          ],
          name: 'Employee',
          javadoc: 'The Employee entity.\\nSecond line in javadoc.',
          entityTableName: 'employee',
          dto: 'mapstruct',
          pagination: 'infinite-scroll',
          readOnly: false,
          embedded: false,
          service: 'serviceClass',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          searchEngine: 'elasticsearch',
        },
        Job: {
          fields: [
            {
              fieldName: 'title',
              fieldType: 'String',
              fieldValidateRules: ['minlength', 'maxlength'],
              fieldValidateRulesMinlength: '5',
              fieldValidateRulesMaxlength: '25',
            },
            {
              fieldName: 'type',
              fieldType: 'JobType',
              fieldValues: 'BOSS,SLAVE',
            },
            {
              fieldName: 'minSalary',
              fieldType: 'Long',
            },
            {
              fieldName: 'maxSalary',
              fieldType: 'Long',
            },
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'linkedJob',
              relationshipName: 'chore',
              otherEntityName: 'task',
              otherEntityField: 'title',
              ownerSide: true,
            },
            {
              relationshipType: 'many-to-one',
              relationshipName: 'emp',
              otherEntityName: 'employee',
              otherEntityRelationshipName: 'job',
              otherEntityField: 'employee',
            },
            {
              relationshipType: 'many-to-many',
              relationshipName: 'history',
              otherEntityName: 'jobHistory',
              otherEntityRelationshipName: 'job',
              ownerSide: false,
            },
          ],
          name: 'Job',
          entityTableName: 'job',
          dto: 'no',
          pagination: 'pagination',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
        JobHistory: {
          fields: [
            {
              fieldName: 'startDate',
              fieldType: 'ZonedDateTime',
            },
            {
              fieldName: 'endDate',
              fieldType: 'ZonedDateTime',
            },
            {
              fieldName: 'language',
              fieldType: 'Language',
              fieldValues: 'FRENCH,ENGLISH,SPANISH',
            },
            {
              fieldName: 'positionDuration',
              fieldType: 'Duration',
            },
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'jobHistory',
              relationshipName: 'department',
              otherEntityName: 'department',
              ownerSide: true,
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'history',
              relationshipName: 'job',
              otherEntityName: 'job',
              ownerSide: true,
            },
            {
              relationshipType: 'many-to-many',
              otherEntityRelationshipName: 'jobHistory',
              relationshipName: 'emp',
              otherEntityName: 'employee',
              otherEntityField: 'employee',
              ownerSide: true,
            },
          ],
          name: 'JobHistory',
          javadoc: 'JobHistory comment.',
          entityTableName: 'job_history',
          dto: 'no',
          readOnly: true,
          embedded: false,
          pagination: 'infinite-scroll',
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
        },
        Location: {
          fields: [
            {
              fieldName: 'streetAddress',
              fieldType: 'String',
            },
            {
              fieldName: 'postalCode',
              fieldType: 'String',
            },
            {
              fieldName: 'city',
              fieldType: 'String',
            },
            {
              fieldName: 'stateProvince',
              fieldType: 'String',
            },
          ],
          relationships: [
            {
              relationshipType: 'one-to-many',
              relationshipName: 'country',
              otherEntityName: 'country',
              otherEntityRelationshipName: 'location',
            },
            {
              options: {
                id: true,
              },
              otherEntityName: 'department',
              otherEntityRelationshipName: 'location',
              ownerSide: false,
              relationshipName: 'department',
              relationshipType: 'one-to-one',
            },
          ],
          name: 'Location',
          entityTableName: 'location',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
        Region: {
          fields: [
            {
              fieldName: 'name',
              fieldType: 'String',
            },
          ],
          relationships: [
            {
              relationshipName: 'country',
              otherEntityName: 'country',
              otherEntityRelationshipName: 'area',
              relationshipType: 'many-to-one',
            },
          ],
          name: 'Region',
          entityTableName: 'region',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
        Task: {
          fields: [
            {
              fieldName: 'title',
              fieldType: 'String',
            },
            {
              fieldName: 'description',
              fieldType: 'String',
            },
          ],
          relationships: [
            {
              relationshipType: 'many-to-many',
              relationshipName: 'linkedJob',
              otherEntityName: 'job',
              ownerSide: false,
              otherEntityField: 'jobTitle',
              otherEntityRelationshipName: 'chore',
            },
          ],
          name: 'Task',
          entityTableName: 'task',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: '*',
          microserviceName: 'mymicroservice',
          javadoc: '',
        },
      };

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'big_sample.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
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
            return exportedEntity;
          });
        filesExist = ENTITY_NAMES.reduce(
          (result, entityName) => result && fse.statSync(path.join('.jhipster', `${entityName}.json`)).isFile()
        );
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should return the final state', () => {
        expect(returned).to.deep.equal({
          exportedEntities: [
            expectedContent.Country,
            expectedContent.Department,
            expectedContent.Employee,
            expectedContent.Job,
            expectedContent.JobHistory,
            expectedContent.Location,
            expectedContent.Region,
            expectedContent.Task,
          ],
          exportedApplications: [],
          exportedDeployments: [],
          exportedApplicationsWithEntities: {},
        });
      });
      it('should create the files', () => {
        expect(filesExist).to.be.true;
      });
      it('should export their content', () => {
        ENTITY_NAMES.forEach(entityName => {
          const entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', `${entityName}.json`), 'utf-8'));
          if (expectedContent[entityName].javadoc === '') {
            delete expectedContent[entityName].javadoc;
          }
          expect(entityContent).to.deep.equal(expectedContent[entityName]);
        });
      });
    });
    context('when passing an existing application config', () => {
      let importer;

      before(() => {
        importer = createImporterFromContent(
          `entity A
entity User
relationship OneToOne {
  User{a} to A
}
`,
          {
            application: JSON.parse(fse.readFileSync(path.join(__dirname, 'test-files', 'jhipster_app', '.yo-rc.json'), 'utf-8')),
          }
        );
      });

      it('should not fail', () => {
        expect(() => importer.import()).not.to.throw();
      });
    });
    context('when parsing one JDL application and entities', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('should create the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing two JDL applications with and without entities ', () => {
      let returned;
      const APPLICATION_NAMES = ['app1', 'app2'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications_with_and_without_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(2);
        expect(Object.keys(returned.exportedApplicationsWithEntities).length).to.equal(2);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should create the entity folder in only one app folder', () => {
        expect(fse.existsSync(path.join(APPLICATION_NAMES[0], '.jhipster'))).to.be.false;
        expect(fse.statSync(path.join(APPLICATION_NAMES[1], '.jhipster')).isDirectory()).to.be.true;
        expect(fse.statSync(path.join(APPLICATION_NAMES[1], '.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should export the application contents', () => {
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[0]].entities).to.have.lengthOf(0);
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[1]].entities).to.have.lengthOf(1);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing one JDL application and entities passed as string', () => {
      let returned;

      before(() => {
        const importer = createImporterFromContent(
          `application {
            config {
              baseName MyApp
              applicationType microservice
              jwtSecretKey "aaa.bbb.ccc"
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

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('should create the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing one JDL application and entities with entity and dto suffixes', () => {
      let returned;
      let content;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_entity_dto_suffixes.jdl')]);
        returned = importer.import();

        content = JSON.parse(fse.readFileSync('.yo-rc.json', 'utf-8'));
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
        expect(content['generator-jhipster'].entitySuffix).to.equal('Entity');
        expect(content['generator-jhipster'].dtoSuffix).to.equal('DTO');
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
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
            withAdminUi: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            entitySuffix: '',
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
          },
        },
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'titi',
            packageName: 'com.mathieu.titi',
            packageFolder: 'com/mathieu/titi',
            authenticationType: 'jwt',
            websocket: false,
            withAdminUi: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: true,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'gateway',
            cacheProvider: 'no',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'microservice',
            testFrameworks: [],
            languages: [],
            serverPort: '8081',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            cacheProvider: 'ehcache',
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            skipUserManagement: true,
            skipClient: true,
          },
        },
        {
          entities: [],
          'generator-jhipster': {
            baseName: 'tutu',
            packageName: 'com.mathieu.tutu',
            packageFolder: 'com/mathieu/tutu',
            authenticationType: 'jwt',
            websocket: false,
            withAdminUi: true,
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
          },
        },
      ];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications2.jdl')]);
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

      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should export the application contents', () => {
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'yeti',
            clientThemeVariant: 'primary',
            skipUserManagement: false,
            entitySuffix: '',
            reactive: false,
            skipClient: false,
            skipServer: false,
            withAdminUi: true,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'microservice',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8091',
            enableSwaggerCodegen: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            skipUserManagement: true,
            skipClient: true,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'microservice',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8092',
            enableSwaggerCodegen: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            skipUserManagement: true,
            skipClient: true,
          },
        },
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
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: ['myFirstApp'],
        },
        {
          name: 'B',
          fields: [],
          relationships: [],
          entityTableName: 'b',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: ['myFirstApp'],
        },
        {
          name: 'E',
          fields: [],
          relationships: [],
          entityTableName: 'e',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: ['myFirstApp', 'mySecondApp'],
          microserviceName: 'mySecondApp',
        },
        {
          name: 'F',
          fields: [],
          relationships: [],
          entityTableName: 'f',
          dto: 'no',
          pagination: 'no',
          readOnly: false,
          embedded: false,
          service: 'no',
          jpaMetamodelFiltering: false,
          fluentMethods: true,
          applications: ['myFirstApp', 'myThirdApp'],
        },
      ];
      let importState;
      before(() => {
        const importer = createImporterFromFiles([
          path.join(__dirname, 'test-files', 'integration', 'file1.jdl'),
          path.join(__dirname, 'test-files', 'integration', 'file2.jdl'),
        ]);
        importState = importer.import();
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(path.join(applicationName));
        });
      });

      it('should generate correct import state', () => {
        expect(importState.exportedApplications.length).to.eql(3);
        expect(importState.exportedEntities.length).to.eql(4);
      });

      it('should export the applications', () => {
        APPLICATION_NAMES.forEach((applicationName, index) => {
          expect(fse.statSync(path.join(applicationName)).isDirectory()).to.be.true;
          const appConfPath = path.join(applicationName, '.yo-rc.json');
          expect(fse.statSync(appConfPath).isFile()).to.be.true;
          const readJSON = JSON.parse(fse.readFileSync(appConfPath, 'utf-8').toString());
          expect(readJSON).to.deep.equal(expectedApplications[index]);
        });
      });

      it('should export the entities for each application', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          let readJSON;
          expect(fse.statSync(path.join(applicationName, '.jhipster')).isDirectory()).to.be.true;
          switch (applicationName) {
            case 'myFirstApp': // A, B, E, F
              ENTITY_NAMES.forEach((entityName, index) => {
                readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', `${entityName}.json`), 'utf-8').toString());
                expect(readJSON).to.deep.equal(expectedEntities[index]);
              });
              break;
            case 'mySecondApp': // only E
              readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', 'E.json'), 'utf-8').toString());
              expect(readJSON).to.deep.equal(expectedEntities[2]);
              break;
            case 'myThirdApp': // only F
              readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', 'F.json'), 'utf-8').toString());
              expect(readJSON).to.deep.equal(expectedEntities[3]);
              break;
            default:
            // nothing to do
          }
        });
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        importState.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = importState.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(importState.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities
          );
        });
      });
    });
    context("when choosing 'no' as database type", () => {
      let importer;

      before("importing a JDL file with the 'no' database type", () => {
        importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.NO,
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
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'annotations.jdl')], {
          applicationName: 'toto',
          databaseType: DatabaseTypes.SQL,
        });
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('sets the options', () => {
        expect(returned.exportedEntities[0].service).to.equal('serviceClass');
        expect(returned.exportedEntities[0].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[0].skipClient).to.be.true;
        expect(returned.exportedEntities[0].myCustomUnaryOption).to.be.true;
        expect(returned.exportedEntities[0].myCustomBinaryOption).to.equal('customValue');
        expect(returned.exportedEntities[1].pagination).to.equal('pagination');
        expect(returned.exportedEntities[1].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[1].service).to.equal('serviceClass');
        expect(returned.exportedEntities[2].skipClient).to.be.true;
        expect(returned.exportedEntities[2].jpaMetamodelFiltering).to.be.true;
        expect(returned.exportedEntities[2].pagination).to.equal('pagination');
        expect(returned.exportedEntities[2].myCustomBinaryOption).to.equal('customValue2');
        expect(returned.exportedEntities[0].fields[0].options.id).to.be.true;
        expect(returned.exportedEntities[0].fields[0].options.multiValue).to.deep.equal(['value1', 'value2', 'value3']);
      });
    });
    context('when parsing a JDL with a pattern validation', () => {
      let returned;
      let entityContent;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'regex_validation.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        returned = importer.import();
        entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', 'Customer.json'), { encoding: 'utf8' }));
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the back-slash in the returned object', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
      it('escapes the back-slash in the written entity file', () => {
        expect(entityContent.fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
    });
    context('when parsing a JDL with a pattern validation containing a quote', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'pattern_validation_with_quote.jdl')], {
          applicationName: 'MyApp',
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the quote', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern.includes("\\'")).to.be.true;
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
            withAdminUi: true,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: true,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'gateway',
            cacheProvider: 'no',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
            withAdminUi: true,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'microservice',
            testFrameworks: [],
            languages: [],
            serverPort: '8081',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            cacheProvider: 'ehcache',
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: 'eureka',
            clientPackageManager: 'npm',
            skipUserManagement: true,
            skipClient: true,
          },
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
            dtoSuffix: 'DTO',
            prodDatabaseType: 'postgresql',
            reactive: false,
            buildTool: 'maven',
            searchEngine: false,
            enableTranslation: true,
            entitySuffix: '',
            applicationType: 'monolith',
            cacheProvider: 'ehcache',
            testFrameworks: [],
            languages: [],
            serverPort: '8080',
            enableSwaggerCodegen: false,
            enableHibernateCache: true,
            jhiPrefix: 'jhi',
            messageBroker: false,
            serviceDiscoveryType: false,
            clientPackageManager: 'npm',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            skipClient: false,
            skipServer: false,
            withAdminUi: true,
          },
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            directoryPath: '../',
            gatewayType: 'SpringCloudGateway',
            clusteredDbApps: [],
            deploymentType: 'docker-compose',
            serviceDiscoveryType: 'eureka',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            monitoring: 'no',
          },
        },
      ];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications3.jdl')]);
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

      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should create the docker-compose folder with .yo-rc.json file', () => {
        expect(fse.statSync(path.join('docker-compose', '.yo-rc.json')).isFile()).to.be.true;
        expect(fse.statSync('docker-compose').isDirectory()).to.be.true;
      });
      it('should export the application & deployment contents', () => {
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
            gatewayType: 'SpringCloudGateway',
            clusteredDbApps: [],
            deploymentType: 'docker-compose',
            serviceDiscoveryType: 'eureka',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            monitoring: 'no',
          },
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            clusteredDbApps: [],
            directoryPath: '../',
            deploymentType: 'kubernetes',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            gatewayType: 'SpringCloudGateway',
            ingressDomain: '',
            istio: false,
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka',
          },
        },
        {
          'generator-jhipster': {
            appsFolders: ['tata', 'titi'],
            clusteredDbApps: [],
            directoryPath: '../',
            deploymentType: 'openshift',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            gatewayType: 'SpringCloudGateway',
            monitoring: 'no',
            openshiftNamespace: 'default',
            serviceDiscoveryType: 'eureka',
            storageType: 'ephemeral',
          },
        },
      ];
      const DEPLOYMENT_NAMES = ['docker-compose', 'kubernetes', 'openshift'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'deployments.jdl')]);
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

      it('should create the folders and the .yo-rc.json files', () => {
        DEPLOYMENT_NAMES.forEach(name => {
          expect(fse.statSync(path.join(name, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(name).isDirectory()).to.be.true;
        });
      });
      it('should export the deployment contents', () => {
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
            dtoSuffix: 'DTO',
            enableHibernateCache: false,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: [],
            messageBroker: false,
            packageName: 'com.jhipster.demo.store',
            packageFolder: 'com/jhipster/demo/store',
            prodDatabaseType: 'mysql',
            reactive: true,
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: false,
            skipServer: false,
            testFrameworks: ['protractor'],
            websocket: false,
            baseName: 'store',
            applicationType: 'gateway',
            authenticationType: 'jwt',
            cacheProvider: 'no',
            buildTool: 'gradle',
            entitySuffix: '',
            clientFramework: 'react',
            clientTheme: 'none',
            clientThemeVariant: '',
            skipUserManagement: false,
            clientPackageManager: 'npm',
            serverPort: '8080',
            withAdminUi: true,
          },
          entities: ['Customer', 'Product', 'ProductCategory', 'ProductOrder', 'OrderItem', 'Invoice', 'Shipment', 'Notification'],
        },
        {
          'generator-jhipster': {
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            dtoSuffix: 'DTO',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: [],
            messageBroker: false,
            packageName: 'com.jhipster.demo.product',
            packageFolder: 'com/jhipster/demo/product',
            prodDatabaseType: 'mysql',
            reactive: false,
            searchEngine: false,
            serviceDiscoveryType: false,
            entitySuffix: '',
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
            clientPackageManager: 'npm',
          },
          entities: ['Product', 'ProductCategory', 'ProductOrder', 'OrderItem'],
        },
        {
          'generator-jhipster': {
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            dtoSuffix: 'DTO',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            jhiPrefix: 'jhi',
            languages: [],
            messageBroker: false,
            packageName: 'com.jhipster.demo.invoice',
            packageFolder: 'com/jhipster/demo/invoice',
            prodDatabaseType: 'mysql',
            reactive: false,
            searchEngine: false,
            serviceDiscoveryType: false,
            skipClient: true,
            testFrameworks: [],
            websocket: false,
            baseName: 'invoice',
            entitySuffix: '',
            applicationType: 'microservice',
            authenticationType: 'jwt',
            buildTool: 'gradle',
            serverPort: '8082',
            skipUserManagement: true,
            clientPackageManager: 'npm',
            cacheProvider: 'ehcache',
          },
          entities: ['Invoice', 'Shipment'],
        },
        {
          'generator-jhipster': {
            databaseType: 'mongodb',
            devDatabaseType: 'mongodb',
            dtoSuffix: 'DTO',
            enableHibernateCache: false,
            enableSwaggerCodegen: false,
            enableTranslation: true,
            entitySuffix: '',
            jhiPrefix: 'jhi',
            languages: [],
            messageBroker: false,
            packageName: 'com.jhipster.demo.notification',
            packageFolder: 'com/jhipster/demo/notification',
            prodDatabaseType: 'mongodb',
            reactive: false,
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
            clientPackageManager: 'npm',
          },
          entities: ['Notification'],
        },
        {
          'generator-jhipster': {
            deploymentType: 'docker-compose',
            gatewayType: 'SpringCloudGateway',
            monitoring: 'no',
            directoryPath: '../',
            appsFolders: ['store', 'invoice', 'notification', 'product'],
            clusteredDbApps: [],
            serviceDiscoveryType: false,
            dockerRepositoryName: 'deepu105',
            dockerPushCommand: 'docker push',
          },
        },
        {
          'generator-jhipster': {
            deploymentType: 'kubernetes',
            gatewayType: 'SpringCloudGateway',
            monitoring: 'no',
            directoryPath: '../',
            appsFolders: ['store', 'invoice', 'notification', 'product'],
            clusteredDbApps: [],
            serviceDiscoveryType: false,
            dockerRepositoryName: 'deepu105',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'LoadBalancer',
            ingressDomain: '',
            istio: false,
          },
        },
      ];
      const FOLDER_NAMES = ['store', 'product', 'invoice', 'notification', 'docker-compose', 'kubernetes'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'realistic_sample.jdl')]);
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

      it('should create the folders and the .yo-rc.json files', () => {
        FOLDER_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should export the application & deployment contents', () => {
        expect(contents).to.deep.equal(expectedContents);
      });
    });
    context('when parsing entities and enums with custom values', () => {
      let exported;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'enum_with_values.jdl')], {
          applicationName: 'toto',
          applicationType: 'monolith',
          databaseType: 'sql',
          generatorVersion: '6.4.1',
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
    context('when parsing JDL applications with options inside', () => {
      let entityA;
      let entityB;
      let entityCInTata;
      let entityCInTutu;
      let entityD;
      let entityE;
      let entityF;

      before(() => {
        const importer = createImporterFromContent(
          `application {
  config {
    applicationType monolith
    baseName tata
  }
  entities A, B, C
  paginate A, C with pagination
}
application {
  config {
    applicationType monolith
    baseName tutu
  }
  entities C, D, E
  dto D with mapstruct
}
entity A
entity B
entity C
entity D
entity E
entity F

paginate * with infinite-scroll
`,
          {
            generatorVersion: '7.0.0',
          }
        );
        importer.import();
        entityA = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'A.json'), 'utf-8'));
        entityB = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'B.json'), 'utf-8'));
        entityCInTata = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'C.json'), 'utf-8'));
        entityCInTutu = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'C.json'), 'utf-8'));
        entityD = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'D.json'), 'utf-8'));
        entityE = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'E.json'), 'utf-8'));
        entityF =
          fse.pathExistsSync(path.join('tata', '.jhipster', 'F.json')) || fse.pathExistsSync(path.join('tutu', '.jhipster', 'F.json'));
      });

      after(() => {
        fse.removeSync('tata');
        fse.removeSync('tutu');
      });

      it('should set them', () => {
        expect(entityA).to.deep.equal({
          applications: ['tata'],
          dto: 'no',
          embedded: false,
          entityTableName: 'a',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'A',
          pagination: 'pagination',
          readOnly: false,
          relationships: [],
          service: 'no',
        });
        expect(entityB).to.deep.equal({
          applications: ['tata'],
          dto: 'no',
          embedded: false,
          entityTableName: 'b',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'B',
          pagination: 'infinite-scroll',
          readOnly: false,
          relationships: [],
          service: 'no',
        });
        expect(entityCInTata).to.deep.equal({
          applications: ['tata', 'tutu'],
          dto: 'no',
          embedded: false,
          entityTableName: 'c',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'C',
          pagination: 'pagination',
          readOnly: false,
          relationships: [],
          service: 'no',
        });
        expect(entityCInTutu).to.deep.equal({
          applications: ['tata', 'tutu'],
          dto: 'no',
          embedded: false,
          entityTableName: 'c',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'C',
          pagination: 'pagination',
          readOnly: false,
          relationships: [],
          service: 'no',
        });
        expect(entityD).to.deep.equal({
          applications: ['tutu'],
          dto: 'mapstruct',
          embedded: false,
          entityTableName: 'd',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'D',
          pagination: 'infinite-scroll',
          readOnly: false,
          relationships: [],
          service: 'serviceClass',
        });
        expect(entityE).to.deep.equal({
          applications: ['tutu'],
          dto: 'no',
          embedded: false,
          entityTableName: 'e',
          fields: [],
          fluentMethods: true,
          jpaMetamodelFiltering: false,
          name: 'E',
          pagination: 'infinite-scroll',
          readOnly: false,
          relationships: [],
          service: 'no',
        });
      });
      it('should not generate entity not in any app', () => {
        expect(entityF).to.be.false;
      });
    });
    context('when passing the skipFileGeneration option', () => {
      before(() => {
        expect(fse.existsSync('.yo-rc.json')).to.be.false;
        expect(fse.existsSync('.jhipster')).to.be.false;

        const importer = createImporterFromContent(
          `application {
  config {
    applicationType monolith
    baseName tata
    clientFramework angularX
  }
  entities A
}

entity A

paginate * with infinite-scroll
`,
          {
            generatorVersion: '7.0.0',
            skipFileGeneration: true,
          }
        );
        importer.import();
      });

      it('should not write the .yo-rc.json file', () => {
        expect(fse.existsSync('.yo-rc.json')).to.be.false;
      });

      it('should not create the .jhipster folder', () => {
        expect(fse.existsSync('.jhipster')).to.be.false;
      });
    });
    context('when passing the unidirectionalRelationships option', () => {
      const entities = `
entity A
entity B

relationship OneToOne {
  A{oneToOneB} to B
  A{biOneToOneB} to B{biOneToOneA}
}
relationship ManyToOne {
  A{manyToOneB} to B
  A{biManyToOneB} to B{biManyToOneA}
}
relationship OneToMany {
  A{oneToManyB} to B
  A{biOneToManyB} to B{biOneToManyA}
}
relationship ManyToMany {
  A{manyToManyB} to B
  A{biManyToManyB} to B{biManyToManyA}
}
`;
      context('when passing without application config', () => {
        let importer;

        before(() => {
          importer = createImporterFromContent(entities, {
            unidirectionalRelationships: true,
            applicationName: 'jhipter',
            databaseType: 'postgresql',
          });
        });

        after(() => {
          fse.removeSync('.jhipster');
        });

        it('should not fail', () => {
          expect(() => importer.import()).not.to.throw();
        });
      });
      context('when parsing one JDL application and entities', () => {
        let returned;

        before(() => {
          const importer = createImporterFromContent(
            `
application {
  config{
    prodDatabaseType postgresql
  }
  entities A, B
}
${entities}`,
            {
              unidirectionalRelationships: true,
            }
          );
          returned = importer.import();
        });

        after(() => {
          fse.unlinkSync('.yo-rc.json');
          fse.removeSync('.jhipster');
        });

        it('should return the import state', () => {
          expect(returned.exportedEntities).to.have.lengthOf(2);
          expect(returned.exportedApplications).to.have.lengthOf(1);
          expect(returned.exportedDeployments).to.have.lengthOf(0);
        });
        it('should return the corresponding exportedApplicationsWithEntities', () => {
          returned.exportedApplications.forEach(application => {
            const applicationConfig = application['generator-jhipster'];
            const entityNames = application.entities || [];
            const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
            expect(applicationConfig).to.be.eql(applicationWithEntities.config);
            expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
            expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
              applicationWithEntities.entities
            );
            expect(applicationWithEntities.entities[0].relationships).to.be.eql([
              {
                otherEntityName: 'b',
                ownerSide: true,
                relationshipName: 'oneToOneB',
                relationshipType: 'one-to-one',
                unidirectional: true,
              },
              {
                otherEntityName: 'b',
                ownerSide: true,
                otherEntityRelationshipName: 'biOneToOneA',
                relationshipName: 'biOneToOneB',
                relationshipType: 'one-to-one',
                unidirectional: false,
              },
              {
                otherEntityName: 'b',
                relationshipName: 'oneToManyB',
                relationshipType: 'one-to-many',
                unidirectional: true,
              },
              {
                otherEntityName: 'b',
                otherEntityRelationshipName: 'biOneToManyA',
                relationshipName: 'biOneToManyB',
                relationshipType: 'one-to-many',
                unidirectional: false,
              },
              {
                otherEntityName: 'b',
                relationshipName: 'manyToOneB',
                relationshipType: 'many-to-one',
                unidirectional: true,
              },
              {
                otherEntityName: 'b',
                otherEntityRelationshipName: 'biManyToOneA',
                relationshipName: 'biManyToOneB',
                relationshipType: 'many-to-one',
                unidirectional: false,
              },
              {
                otherEntityName: 'b',
                ownerSide: true,
                relationshipName: 'manyToManyB',
                relationshipType: 'many-to-many',
                unidirectional: true,
              },
              {
                otherEntityName: 'b',
                ownerSide: true,
                otherEntityRelationshipName: 'biManyToManyA',
                relationshipName: 'biManyToManyB',
                relationshipType: 'many-to-many',
                unidirectional: false,
              },
            ]);
            expect(applicationWithEntities.entities[1].relationships).to.be.eql([
              {
                otherEntityName: 'a',
                ownerSide: false,
                otherEntityRelationshipName: 'biOneToOneB',
                relationshipName: 'biOneToOneA',
                relationshipType: 'one-to-one',
              },
              {
                otherEntityName: 'a',
                otherEntityRelationshipName: 'biOneToManyB',
                relationshipName: 'biOneToManyA',
                relationshipType: 'many-to-one',
              },
              {
                otherEntityName: 'a',
                otherEntityRelationshipName: 'biManyToOneB',
                relationshipName: 'biManyToOneA',
                relationshipType: 'one-to-many',
              },
              {
                otherEntityName: 'a',
                ownerSide: false,
                otherEntityRelationshipName: 'biManyToManyB',
                relationshipName: 'biManyToManyA',
                relationshipType: 'many-to-many',
              },
            ]);
          });
        });
      });
    });
    context('when not exporting entities but only applications', () => {
      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application.jdl')]);
        importer.import();
      });
      after(() => {
        fse.removeSync('.yo-rc.json');
      });
      it('should export the .yo-rc.json file', () => {
        expect(fse.existsSync('.yo-rc.json')).to.be.true;
      });
      it('should not create the .jhipster folder', () => {
        expect(fse.existsSync('.jhipster')).to.be.false;
      });
    });
    context('when importing a JDL application with blueprints', () => {
      let importState;
      let parameter;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_blueprints.jdl')]);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        importState = importer.import(logger);
      });
      after(() => {
        fse.removeSync('.yo-rc.json');
      });

      it('should return the blueprints attributes in the application', () => {
        expect(importState.exportedApplications).to.deep.equal([
          {
            entities: [],
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'appWithBlueprints',
              blueprints: [{ name: 'generator-jhipster-vuejs' }, { name: 'generator-jhipster-dotnetcore' }],
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angularX',
              clientPackageManager: 'npm',
              clientTheme: 'none',
              clientThemeVariant: '',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              dtoSuffix: 'DTO',
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: true,
              entitySuffix: '',
              jhiPrefix: 'jhi',
              languages: [],
              messageBroker: false,
              packageFolder: 'com/mycompany/myapp',
              packageName: 'com.mycompany.myapp',
              prodDatabaseType: 'postgresql',
              searchEngine: false,
              reactive: false,
              serverPort: '8080',
              serviceDiscoveryType: false,
              skipClient: false,
              skipServer: false,
              skipUserManagement: false,
              testFrameworks: [],
              websocket: false,
              withAdminUi: true,
            },
          },
        ]);
      });

      it('should warn about not performing jdl validation', () => {
        expect(parameter).to.equal('Blueprints are being used, the JDL validation phase is skipped.');
      });
    });
    context('when choosing neo4j as database type', () => {
      let importState;

      before(() => {
        const content = `entity Person {
   name String
}

relationship OneToMany {
   Person{friends} to Person
}`;
        const importer = createImporterFromContent(content, {
          applicationName: 'toto',
          databaseType: 'neo4j',
        });
        importState = importer.import();
      });
      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should not generate a bidirectional one-to-many relationship', () => {
        expect(importState.exportedEntities[0].relationships).to.have.length(1);
      });
    });
    context('when having the use-options', () => {
      let importState;

      before(() => {
        const content = `application {
  config {
    baseName toto
  }
  entities A, B, C
  use serviceImpl for * except C
}

entity A
entity B
entity C

use mapstruct, elasticsearch for A, B except C`;
        const importer = createImporterFromContent(content, {
          applicationName: 'toto',
          databaseType: 'sql',
        });
        importState = importer.import();
      });
      after(() => {
        fse.removeSync('.jhipster');
        fse.unlinkSync('.yo-rc.json');
      });

      it('should add the options', () => {
        expect(importState.exportedEntities[0].dto).to.equal('mapstruct');
        expect(importState.exportedEntities[1].dto).to.equal('mapstruct');
        expect(importState.exportedEntities[2].dto).not.to.equal('mapstruct');
        expect(importState.exportedEntities[0].service).to.equal('serviceImpl');
        expect(importState.exportedEntities[1].service).to.equal('serviceImpl');
        expect(importState.exportedEntities[2].service).not.to.equal('serviceImpl');
        expect(importState.exportedEntities[0].searchEngine).to.equal('elasticsearch');
        expect(importState.exportedEntities[1].searchEngine).to.equal('elasticsearch');
        expect(importState.exportedEntities[2].searchEngine).not.to.equal('elasticsearch');
      });
    });
    context('when parsing a JDL content with invalid tokens', () => {
      let caughtError;

      before(() => {
        const content = `application {
  config {
    baseName toto
    databaseType sql
    unknownOption toto
  }
  entities A
}

entity A
`;
        try {
          const importer = createImporterFromContent(content);
          importer.import();
        } catch (error) {
          caughtError = error;
        }
      });

      it('should report it', () => {
        expect(caughtError.message).to.equal(
          "MismatchedTokenException: Found an invalid token 'unknownOption', at line: 5 and column: 5.\n\tPlease make sure your JDL content does not use invalid characters, keywords or options."
        );
      });
    });
    context('when parsing relationships with annotations and options', () => {
      let relationshipOnSource;
      let relationshipOnDestination;

      before(() => {
        const content = `entity A
entity B

relationship OneToOne {
  @id A{b} to @NotId(value) @Something B{a} with jpaDerivedIdentifier
}
`;
        const importer = createImporterFromContent(content, { databaseType: 'postgresql', applicationName: 'toto' });
        const imported = importer.import();
        relationshipOnSource = imported.exportedEntities[0].relationships[0];
        relationshipOnDestination = imported.exportedEntities[1].relationships[0];
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should export them', () => {
        expect(relationshipOnSource).to.deep.equal({
          options: { notId: 'value', something: true },
          otherEntityName: 'b',
          otherEntityRelationshipName: 'a',
          ownerSide: true,
          relationshipName: 'b',
          relationshipType: 'one-to-one',
          useJPADerivedIdentifier: true,
        });
        expect(relationshipOnDestination).to.deep.equal({
          options: { id: true },
          otherEntityName: 'a',
          otherEntityRelationshipName: 'b',
          ownerSide: false,
          relationshipName: 'a',
          relationshipType: 'one-to-one',
        });
      });
    });
  });
});

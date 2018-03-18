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
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const JDLReader = require('../../../lib/reader/jdl_reader');
const DocumentParser = require('../../../lib/parser/document_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const JHipsterApplicationParser = require('../../../lib/export/jhipster_application_exporter');
const JHipsterEntityExporter = require('../../../lib/export/jhipster_entity_exporter');
const JDLExporter = require('../../../lib/export/jdl_exporter');

describe('integration tests', () => {
  context('when parsing a JDL and exporting JSON files', () => {
    const ENTITY_NAMES = ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'];
    let filesExist = true;
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
        entityTableName: 'country',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        skipServer: true,
        microserviceName: 'mymicroservice'
      },
      Department: {
        fields: [
          {
            fieldName: 'name',
            fieldType: 'String',
            fieldValidateRules: [
              'required'
            ]
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
        entityTableName: 'department',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        microserviceName: 'mymicroservice'
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
            fieldValidateRules: [
              'minlength',
              'maxlength'
            ],
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
        entityTableName: 'job',
        dto: 'no',
        pagination: 'pagination',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        microserviceName: 'mymicroservice'
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
        entityTableName: 'location',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        microserviceName: 'mymicroservice'
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
        entityTableName: 'region',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        microserviceName: 'mymicroservice'
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
        entityTableName: 'task',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: '*',
        microserviceName: 'mymicroservice'
      }
    };

    before(() => {
      const parsed = JDLReader.parseFromFiles([path.join('test', 'test_files', 'big_sample.jdl')]);
      const jdlObject = DocumentParser.parseFromConfigurationObject({
        document: parsed,
        databaseType: DatabaseTypes.SQL,
        applicationType: ApplicationTypes.MONOLITH
      });
      const jsonEntities = EntityParser.parse({
        jdlObject,
        databaseType: DatabaseTypes.SQL
      });
      JHipsterEntityExporter.exportEntities({
        entities: jsonEntities,
        application: {
          name: 'MyApp',
          type: ApplicationTypes.MONOLITH
        }
      });
      filesExist = ENTITY_NAMES.reduce((result, entityName) =>
        result && fs.statSync(path.join('.jhipster', `${entityName}.json`)).isFile());
    });

    after(() => {
      ENTITY_NAMES.forEach((entityName) => {
        fs.unlinkSync(path.join('.jhipster', `${entityName}.json`));
      });
      fs.rmdirSync('.jhipster');
    });

    it('creates the files', () => {
      expect(filesExist).to.be.true;
    });
    it('exports their content', () => {
      ENTITY_NAMES.forEach((entityName) => {
        const entityContent = JSON.parse(fs.readFileSync(path.join('.jhipster', `${entityName}.json`), 'utf-8'));
        expect(entityContent.changelogDate).not.to.be.undefined;
        delete entityContent.changelogDate;
        expect(entityContent).to.deep.equal(expectedContent[entityName]);
      });
    });
  });
  context('when parsing and exporting a JDL', () => {
    let originalContent = null;
    let writtenContent = null;

    before(() => {
      originalContent = DocumentParser.parseFromConfigurationObject({
        document: JDLReader.parseFromFiles([path.join('test', 'test_files', 'big_sample.jdl')]),
        databaseType: DatabaseTypes.SQL,
        applicationType: ApplicationTypes.MONOLITH
      });
      JDLExporter.exportToJDL(originalContent, 'exported.jdl');
      writtenContent = DocumentParser.parseFromConfigurationObject({
        document: JDLReader.parseFromFiles(['exported.jdl']),
        databaseType: DatabaseTypes.SQL,
        applicationType: ApplicationTypes.MONOLITH
      });
    });

    after(() => {
      fs.unlinkSync('exported.jdl');
    });

    it('keeps the same JDL content', () => {
      expect(writtenContent).to.deep.equal(originalContent);
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8080',
          enableSwaggerCodegen: false,
          enableHibernateCache: true,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8080',
          enableSwaggerCodegen: false,
          enableHibernateCache: true,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8081',
          enableSwaggerCodegen: false,
          enableHibernateCache: true,
          cacheProvider: 'hazelcast',
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8080',
          enableSwaggerCodegen: false,
          enableHibernateCache: true,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
          clientFramework: 'angularX',
          nativeLanguage: 'en',
          skipUserManagement: false,
          skipClient: false,
          skipServer: false
        }
      }
    ];
    const APPLICATION_PATHS = [
      path.join('..', 'tata'),
      'titi',
      path.join('..', '..', 'toto'),
      'tutu'
    ];

    before(() => {
      const parsed = JDLReader.parseFromFiles([path.join('test', 'test_files', 'applications2.jdl')]);
      const jdlObject = DocumentParser.parseFromConfigurationObject({
        document: parsed,
        databaseType: DatabaseTypes.SQL,
        applicationType: ApplicationTypes.MONOLITH
      });
      JHipsterApplicationParser.exportApplications({
        applications: jdlObject.applications,
        paths: {
          tata: jdlObject.applications.tata.config.path,
          titi: jdlObject.applications.titi.config.path,
          toto: jdlObject.applications.toto.config.path,
          tutu: jdlObject.applications.tutu.config.path
        }
      });
      APPLICATION_PATHS.forEach((applicationPath) => {
        contents.push(JSON.parse(fs.readFileSync(path.join(applicationPath, '.yo-rc.json'), 'utf-8')));
      });
    });

    after(() => {
      APPLICATION_PATHS.forEach((applicationPath) => {
        fs.unlinkSync(path.join(applicationPath, '.yo-rc.json'));
        fs.rmdirSync(applicationPath);
      });
    });

    it('creates the folders and the .yo-rc.json files', () => {
      APPLICATION_PATHS.forEach((applicationPath) => {
        expect(fs.statSync(path.join(applicationPath, '.yo-rc.json')).isFile()).to.be.true;
        expect(fs.statSync(applicationPath).isDirectory()).to.be.true;
      });
    });
    it('exports the application contents', () => {
      contents.forEach((content) => {
        expect(content['generator-jhipster'].jwtSecretKey).not.to.be.undefined;
        delete content['generator-jhipster'].jwtSecretKey;
      });
      expect(contents).to.deep.equal(expectedContents);
    });
  });
  context('when parsing multiple JDL files with applications and entities', () => {
    const APPLICATIONS_PATH = path.join('..', '..');
    const APPLICATION_NAMES = ['myFirstApp', 'mySecondApp', 'myThirdApp'];
    const ENTITY_NAMES = ['A', 'B', 'E', 'F']; // C & D don't get to be generated
    const expectedApplications = [
      {
        entities: [
          'A',
          'B',
          'E',
          'F'
        ],
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8080',
          enableSwaggerCodegen: false,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
          clientFramework: 'angularX',
          nativeLanguage: 'en',
          skipUserManagement: false,
          skipClient: false,
          skipServer: false
        }
      },
      {
        entities: [
          'E'
        ],
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8091',
          enableSwaggerCodegen: false,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
          clientFramework: 'angularX',
          nativeLanguage: 'en',
          skipUserManagement: false,
          skipClient: true,
          skipServer: false
        }
      },
      {
        entities: [
          'F'
        ],
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
          languages: [
            'en', 'fr'
          ],
          serverPort: '8092',
          enableSwaggerCodegen: false,
          useSass: false,
          jhiPrefix: 'jhi',
          messageBroker: false,
          serviceDiscoveryType: false,
          clientPackageManager: 'yarn',
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
        fields: [],
        relationships: [],
        entityTableName: 'a',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: [
          'myFirstApp'
        ]
      },
      {
        fields: [],
        relationships: [],
        entityTableName: 'b',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: [
          'myFirstApp'
        ]
      },
      {
        fields: [],
        relationships: [],
        entityTableName: 'e',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: [
          'myFirstApp',
          'mySecondApp'
        ],
        microserviceName: 'mySecondApp'
      },
      {
        fields: [],
        relationships: [],
        entityTableName: 'f',
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false,
        fluentMethods: true,
        clientRootFolder: '',
        applications: [
          'myFirstApp',
          'myThirdApp'
        ]
      }
    ];

    before(() => {
      const parsed = JDLReader.parseFromFiles([
        path.join('test', 'test_files', 'integration', 'file1.jdl'),
        path.join('test', 'test_files', 'integration', 'file2.jdl')
      ]);
      const jdlObject = DocumentParser.parseFromConfigurationObject({
        document: parsed,
        databaseType: DatabaseTypes.SQL
      });
      const jsonEntities = EntityParser.parse({
        jdlObject,
        databaseType: DatabaseTypes.SQL
      });
      JHipsterApplicationParser.exportApplications({
        applications: jdlObject.applications,
        paths: {
          myFirstApp: jdlObject.applications.myFirstApp.config.path,
          mySecondApp: jdlObject.applications.mySecondApp.config.path,
          myThirdApp: jdlObject.applications.myThirdApp.config.path,
        }
      });
      JHipsterEntityExporter.exportEntitiesInApplications({
        entities: jsonEntities,
        applications: jdlObject.applications
      });
    });

    after(() => {
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'myFirstApp', '.jhipster', 'A.json'));
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'myFirstApp', '.jhipster', 'B.json'));
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'myFirstApp', '.jhipster', 'E.json'));
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'myFirstApp', '.jhipster', 'F.json'));
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'mySecondApp', '.jhipster', 'E.json'));
      fs.unlinkSync(path.join(APPLICATIONS_PATH, 'myThirdApp', '.jhipster', 'F.json'));
      APPLICATION_NAMES.forEach((applicationName) => {
        fs.unlinkSync(path.join(APPLICATIONS_PATH, applicationName, '.yo-rc.json'));
        fs.rmdirSync(path.join(APPLICATIONS_PATH, applicationName, '.jhipster'));
        fs.rmdirSync(path.join(APPLICATIONS_PATH, applicationName));
      });
    });

    it('exports the applications', () => {
      APPLICATION_NAMES.forEach((applicationName, index) => {
        expect(fs.statSync(path.join(APPLICATIONS_PATH, applicationName)).isDirectory()).to.be.true;
        const appConfPath = path.join(APPLICATIONS_PATH, applicationName, '.yo-rc.json');
        expect(fs.statSync(appConfPath).isFile()).to.be.true;
        const readJSON = JSON.parse(fs.readFileSync(appConfPath, 'utf-8').toString());
        expect(readJSON['generator-jhipster'].jwtSecretKey).not.to.be.undefined;
        delete readJSON['generator-jhipster'].jwtSecretKey;
        expect(readJSON).to.deep.equal(expectedApplications[index]);
      });
    });
    it('exports the entities for each application', () => {
      APPLICATION_NAMES.forEach((applicationName) => {
        let readJSON = null;
        expect(fs.statSync(path.join(APPLICATIONS_PATH, applicationName, '.jhipster')).isDirectory()).to.be.true;
        switch (applicationName) {
        case 'myFirstApp': // A, B, E, F
          ENTITY_NAMES.forEach((entityName, index) => {
            readJSON = JSON.parse(
              fs.readFileSync(
                path.join(APPLICATIONS_PATH, applicationName, '.jhipster', `${entityName}.json`),
                'utf-8'
              ).toString());
            expect(readJSON.changelogDate).not.to.be.undefined;
            delete readJSON.changelogDate;
            expect(readJSON).to.deep.equal(expectedEntities[index]);
          });
          break;
        case 'mySecondApp': // only E
          readJSON = JSON.parse(
            fs.readFileSync(
              path.join(APPLICATIONS_PATH, applicationName, '.jhipster', 'E.json'),
              'utf-8'
            ).toString());
          expect(readJSON.changelogDate).not.to.be.undefined;
          delete readJSON.changelogDate;
          expect(readJSON).to.deep.equal(expectedEntities[2]);
          break;
        case 'myThirdApp': // only F
          readJSON = JSON.parse(
            fs.readFileSync(
              path.join(APPLICATIONS_PATH, applicationName, '.jhipster', 'F.json'),
              'utf-8'
            ).toString());
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
});

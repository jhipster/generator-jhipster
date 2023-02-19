import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers } from '../../test/support/index.mjs';
import { GENERATOR_EXPORT_JDL } from '../generator-list.mjs';

const files = {
  '.jhipster/Country.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'region',
        otherEntityName: 'region',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'country',
      },
    ],
    fields: [
      {
        fieldName: 'countryId',
        fieldType: 'Long',
        javadoc: 'The country Id',
      },
      {
        fieldName: 'countryName',
        fieldType: 'String',
      },
    ],
    changelogDate: '20160926101210',
    entityTableName: 'country',
    dto: 'no',
    pagination: 'no',
    service: 'no',
  },
  '.jhipster/Department.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'location',
        otherEntityName: 'location',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'department',
      },
      {
        relationshipType: 'one-to-many',
        relationshipValidateRules: 'required',
        relationshipName: 'employee',
        otherEntityName: 'employee',
        otherEntityRelationshipName: 'department',
      },
    ],
    fields: [
      {
        fieldName: 'departmentId',
        fieldType: 'Long',
      },
      {
        fieldName: 'departmentName',
        fieldType: 'String',
        fieldValidateRules: ['required'],
      },
    ],
    changelogDate: '20160926092246',
    entityTableName: 'department',
    dto: 'no',
    pagination: 'no',
    service: 'no',
    fluentMethods: false,
  },
  '.jhipster/Employee.json': {
    relationships: [
      {
        relationshipName: 'department',
        otherEntityName: 'department',
        relationshipType: 'many-to-one',
        otherEntityField: 'foo',
      },
      {
        relationshipType: 'one-to-many',
        relationshipName: 'job',
        otherEntityName: 'job',
        otherEntityRelationshipName: 'employee',
      },
      {
        relationshipType: 'many-to-one',
        relationshipName: 'manager',
        otherEntityName: 'employee',
        otherEntityField: 'id',
      },
    ],
    fields: [
      {
        fieldName: 'employeeId',
        fieldType: 'Long',
      },
      {
        fieldName: 'employeeUuid',
        fieldType: 'UUID',
      },
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
        fieldValidateRules: ['min', 'max'],
        fieldValidateRulesMin: 10000,
        fieldValidateRulesMax: 1000000,
      },
      {
        fieldName: 'commissionPct',
        fieldType: 'Long',
      },
    ],
    changelogDate: '20160926083805',
    javadoc: 'The Employee entity.',
    entityTableName: 'emp',
    dto: 'mapstruct',
    pagination: 'infinite-scroll',
    service: 'serviceClass',
    fluentMethods: false,
    searchEngine: 'elasticsearch',
    angularJSSuffix: 'myentities',
    microserviceName: 'mymicroservice',
  },
  '.jhipster/Job.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipName: 'employee',
        otherEntityName: 'employee',
        relationshipType: 'many-to-one',
        otherEntityField: 'id',
      },
      {
        relationshipType: 'many-to-many',
        otherEntityRelationshipName: 'job',
        relationshipName: 'task',
        otherEntityName: 'task',
        otherEntityField: 'title',
        ownerSide: true,
      },
    ],
    fields: [
      {
        fieldName: 'jobId',
        fieldType: 'Long',
      },
      {
        fieldName: 'jobTitle',
        fieldType: 'String',
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
    changelogDate: '20160924093047',
    entityTableName: 'job',
    dto: 'no',
    pagination: 'pagination',
    service: 'no',
  },
  '.jhipster/JobHistory.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'job',
        otherEntityName: 'job',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'jobHistory',
      },
      {
        relationshipType: 'one-to-one',
        relationshipName: 'department',
        otherEntityName: 'department',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'jobHistory',
      },
      {
        relationshipType: 'one-to-one',
        relationshipName: 'employee',
        otherEntityName: 'employee',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'jobHistory',
      },
    ],
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
    ],
    changelogDate: '20160924092444',
    entityTableName: 'job_history',
    dto: 'no',
    pagination: 'infinite-scroll',
    service: 'no',
  },
  '.jhipster/NoEntity.txt': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'country',
        otherEntityName: 'country',
        otherEntityField: 'id',
        ownerSide: true,
        otherEntityRelationshipName: 'location',
      },
    ],
    fields: [
      {
        fieldName: 'locationId',
        fieldType: 'Long',
      },
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
    changelogDate: '20160924092439',
    entityTableName: 'location',
    dto: 'no',
    pagination: 'no',
    service: 'no',
  },
  '.jhipster/Region.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'country',
        otherEntityName: 'country',
        ownerSide: false,
        otherEntityRelationshipName: 'region',
      },
    ],
    fields: [
      {
        fieldName: 'regionId',
        fieldType: 'Long',
      },
      {
        fieldName: 'regionName',
        fieldType: 'String',
      },
    ],
    changelogDate: '20160926083800',
    entityTableName: 'region',
    dto: 'no',
    pagination: 'no',
    service: 'no',
  },
  '.jhipster/Task.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'many-to-many',
        relationshipValidateRules: 'required',
        relationshipName: 'job',
        otherEntityName: 'job',
        ownerSide: false,
        otherEntityRelationshipName: 'task',
      },
    ],
    fields: [
      {
        fieldName: 'taskId',
        fieldType: 'Long',
      },
      {
        fieldName: 'title',
        fieldType: 'String',
      },
      {
        fieldName: 'description',
        fieldType: 'String',
      },
    ],
    changelogDate: '20160926100704',
    entityTableName: 'task',
    dto: 'no',
    pagination: 'no',
    service: 'no',
  },
};

const applicationConfig = {
  jhipsterVersion: '3.7.1',
  baseName: 'standard',
  packageName: 'com.mycompany.myapp',
  packageFolder: 'com/mycompany/myapp',
  serverPort: '8080',
  authenticationType: 'session',
  cacheProvider: 'ehcache',
  enableHibernateCache: true,
  websocket: 'no',
  databaseType: 'sql',
  devDatabaseType: 'h2Memory',
  prodDatabaseType: 'postgresql',
  searchEngine: 'no',
  buildTool: 'gradle',
  rememberMeKey: '5f1100e7eae25e2abe32d7b2031ac1f2acc778d8',
  applicationType: 'monolith',
  testFrameworks: [],
  jhiPrefix: 'jhi',
  enableTranslation: true,
  nativeLanguage: 'en',
  languages: ['en'],
  skipClient: true,
  skipServer: true,
};

describe('generator - export-jdl', () => {
  describe('exports entities to a JDL file without argument', () => {
    let runResult;

    before(async () => {
      runResult = await helpers.runJHipster(GENERATOR_EXPORT_JDL).withJHipsterConfig(applicationConfig).withFiles(files).commitFiles();
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot(file => file.path.endsWith('.jdl'))).toMatchSnapshot();
    });
    it('creates the jdl file based on app name', () => {
      runResult.assertFile('standard.jdl');
    });
  });

  describe('exports entities to a JDL file with file argument', () => {
    let runResult;

    before(async () => {
      runResult = await helpers
        .runJHipster(GENERATOR_EXPORT_JDL)
        .withJHipsterConfig(applicationConfig)
        .withFiles(files)
        .commitFiles()
        .withArguments('custom-app.jdl');
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot(file => file.path.endsWith('.jdl'))).toMatchSnapshot();
    });
    it('creates the jdl file', () => {
      runResult.assertFile('custom-app.jdl');
    });
  });
});

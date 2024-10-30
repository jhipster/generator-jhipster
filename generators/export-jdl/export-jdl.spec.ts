import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { GENERATOR_EXPORT_JDL } from '../generator-list.js';

const files = {
  '.jhipster/Country.json': {
    fluentMethods: true,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'region',
        otherEntityName: 'region',
        otherEntityField: 'id',
        relationshipSide: 'left',
        otherEntityRelationshipName: 'country',
      },
    ],
    fields: [
      {
        fieldName: 'countryId',
        fieldType: 'Long',
        documentation: 'The country Id',
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
    fluentMethods: false,
    relationships: [
      {
        relationshipType: 'one-to-one',
        relationshipName: 'location',
        otherEntityName: 'location',
        otherEntityField: 'id',
        relationshipSide: 'left',
        otherEntityRelationshipName: 'department',
      },
      {
        relationshipType: 'one-to-many',
        relationshipValidateRules: 'required',
        relationshipName: 'employee',
        relationshipSide: 'left',
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
  },
  '.jhipster/Employee.json': {
    relationships: [
      {
        relationshipSide: 'right',
        relationshipName: 'department',
        otherEntityName: 'department',
        relationshipType: 'many-to-one',
        otherEntityField: 'foo',
        otherEntityRelationshipName: 'employee',
      },
      {
        relationshipType: 'one-to-many',
        relationshipName: 'job',
        otherEntityName: 'job',
        relationshipSide: 'left',
        otherEntityRelationshipName: 'employee',
      },
      {
        relationshipType: 'many-to-one',
        relationshipName: 'manager',
        otherEntityName: 'employee',
        relationshipSide: 'left',
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
        documentation: 'The firstname attribute.',
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
    documentation: 'The Employee entity.',
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
        relationshipSide: 'right',
        otherEntityField: 'id',
        otherEntityRelationshipName: 'job',
      },
      {
        relationshipType: 'many-to-many',
        otherEntityRelationshipName: 'job',
        relationshipName: 'task',
        otherEntityName: 'task',
        otherEntityField: 'title',
        relationshipSide: 'left',
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
        relationshipSide: 'left',
        otherEntityRelationshipName: 'jobHistory',
      },
      {
        relationshipType: 'one-to-one',
        relationshipName: 'department',
        otherEntityName: 'department',
        otherEntityField: 'id',
        relationshipSide: 'left',
        otherEntityRelationshipName: 'jobHistory',
      },
      {
        relationshipType: 'one-to-one',
        relationshipName: 'employee',
        otherEntityName: 'employee',
        otherEntityField: 'id',
        relationshipSide: 'left',
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
        relationshipSide: 'left',
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
        relationshipSide: 'right',
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
        relationshipSide: 'right',
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
  jhiPrefix: 'jhi',
  enableTranslation: true,
  nativeLanguage: 'en',
  languages: ['en'],
  skipClient: true,
  skipServer: true,
} as const;

describe('generator - export-jdl', () => {
  describe('exports entities to a JDL file without argument', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_EXPORT_JDL).withJHipsterConfig<any>(applicationConfig).withFiles(files).commitFiles();
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot(file => file.path.endsWith('.jdl'))).toMatchSnapshot();
    });
    it('creates the jdl file based on app name', () => {
      runResult.assertFile('standard.jdl');
    });
  });

  describe('exports entities to a JDL file with file argument', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_EXPORT_JDL)
        .withJHipsterConfig<any>(applicationConfig)
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

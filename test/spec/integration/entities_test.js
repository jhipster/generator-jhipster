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
const DatabaseTypes = require('../../../lib/core/jhipster/database_types').Types;
const JDLReader = require('../../../lib/reader/jdl_reader');
const DocumentParser = require('../../../lib/parser/document_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const JHipsterEntityExporter = require('../../../lib/export/jhipster_entity_exporter');
const JDLExporter = require('../../../lib/export/jdl_exporter');

describe('entity integration tests', () => {
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
      const parsed = JDLReader.parseFromFiles(['./test/test_files/big_sample.jdl']);
      const jdlObject = DocumentParser.parseFromConfigurationObject({
        document: parsed,
        databaseType: DatabaseTypes.sql,
        applicationType: ApplicationTypes.MONOLITH
      });
      const jsonEntities = EntityParser.parse({
        jdlObject,
        databaseType: DatabaseTypes.sql
      });
      JHipsterEntityExporter.exportEntities({
        entities: jsonEntities,
        applicationName: 'MyApp',
        applicationType: ApplicationTypes.MONOLITH
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
        document: JDLReader.parseFromFiles(['./test/test_files/big_sample.jdl']),
        databaseType: DatabaseTypes.sql,
        applicationType: ApplicationTypes.MONOLITH
      });
      JDLExporter.exportToJDL(originalContent, 'exported.jdl');
      writtenContent = DocumentParser.parseFromConfigurationObject({
        document: JDLReader.parseFromFiles(['exported.jdl']),
        databaseType: DatabaseTypes.sql,
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
});

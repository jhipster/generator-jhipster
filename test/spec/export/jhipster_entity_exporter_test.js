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
const expect = require('chai').expect;
const fs = require('fs');
const Exporter = require('../../../lib/export/jhipster_entity_exporter');
const JDLParser = require('../../../lib/parser/jdl_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

const fail = expect.fail;

describe('::exportEntities', () => {
  describe('when passing invalid parameters', () => {
    describe('such as undefined', () => {
      it('throws an error', () => {
        try {
          Exporter.exportEntities();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when exporting JDL to entity json for SQL type', () => {
      const input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
      const content = EntityParser.parse({
        jdlObject: JDLParser.parse({
          document: input,
          databaseType: 'sql'
        }),
        databaseType: 'sql'
      });
      Exporter.exportEntities(content);
      const department = JSON.parse(fs.readFileSync('.jhipster/Department.json', { encoding: 'utf-8' }));
      const jobHistory = JSON.parse(fs.readFileSync('.jhipster/JobHistory.json', { encoding: 'utf-8' }));

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
        // clean up the mess...
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
    describe('when exporting JDL to entity json for an existing entity', () => {
      let input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      let content = EntityParser.parse({
        jdlObject: JDLParser.parse({
          document: input,
          databaseType: 'sql'
        }),
        databaseType: 'sql'
      });
      it('exports it with same changeLogDate', (done) => {
        Exporter.exportEntities(content);
        expect(fs.statSync('.jhipster/A.json').isFile()).to.be.true;
        const changeLogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
        setTimeout(() => {
          input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: JDLParser.parse({
              document: input,
              databaseType: 'sql'
            }),
            databaseType: 'sql'
          });
          Exporter.exportEntities(content, true);
          expect(fs.statSync('.jhipster/A.json').isFile()).to.be.true;
          const newChangeLogDate = JSON.parse(fs.readFileSync('.jhipster/A.json', { encoding: 'utf-8' })).changelogDate;
          expect(newChangeLogDate).to.eq(changeLogDate);
          // clean up the mess...
          fs.unlinkSync('.jhipster/A.json');
          fs.unlinkSync('.jhipster/B.json');
          fs.unlinkSync('.jhipster/C.json');
          fs.unlinkSync('.jhipster/D.json');
          fs.rmdirSync('.jhipster');
          done();
        }, 1000);
      });
    });
  });
});

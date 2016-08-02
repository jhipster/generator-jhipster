'use strict';

const expect = require('chai').expect,
    fs = require('fs'),
    fail = expect.fail,
    Exporter = require('../../../lib/export/json_exporter'),
    JDLParser = require('../../../lib/parser/jdl_parser'),
    EntityParser = require('../../../lib/parser/entity_parser'),
    parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::exportToJSON', function () {
  describe('when passing invalid parameters', function () {
    describe('such as undefined', function () {
      it('throws an error', function () {
        try {
          Exporter.exportToJSON();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when exporting JDL to entity json for SQL type', function () {
      it('exports it', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        var content = EntityParser.parse({jdlObject: JDLParser.parse(input, 'sql'), databaseType: 'sql'});
        Exporter.exportToJSON(content);
        expect(fs.statSync('.jhipster/Department.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/JobHistory.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Job.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Employee.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Location.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Task.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Country.json').isFile()).to.be.true;
        expect(fs.statSync('.jhipster/Region.json').isFile()).to.be.true;
        var department = JSON.parse(fs.readFileSync('.jhipster/Department.json', {encoding: 'utf-8'}));
        expect(department.relationships).to.deep.eq([
          {
            "relationshipType": "one-to-one",
            "relationshipName": "location",
            "otherEntityName": "location",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "department"
          },
          {
            "relationshipType": "one-to-many",
            "relationshipName": "employee",
            "otherEntityName": "employee",
            "otherEntityRelationshipName": "department"
          }
        ]);
        expect(department.fields).to.deep.eq([
          {
            "fieldName": "departmentId",
            "fieldType": "Long"
          },
          {
            "fieldName": "departmentName",
            "fieldType": "String",
            "fieldValidateRules": ["required"]
          }
        ]);
        expect(department.dto).to.eq('no');
        expect(department.service).to.eq('no');
        expect(department.pagination).to.eq('no');
        var jobHistory = JSON.parse(fs.readFileSync('.jhipster/JobHistory.json', {encoding: 'utf-8'}));
        expect(jobHistory.relationships).to.deep.eq([
          {
            "relationshipType": "one-to-one",
            "relationshipName": "department",
            "otherEntityName": "department",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          },
          {
            "relationshipType": "one-to-one",
            "relationshipName": "job",
            "otherEntityName": "job",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          },
          {
            "relationshipType": "one-to-one",
            "relationshipName": "employee",
            "otherEntityName": "employee",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          }
        ]);
        expect(jobHistory.fields).to.deep.eq([
          {
            "fieldName": "startDate",
            "fieldType": "ZonedDateTime"
          },
          {
            "fieldName": "endDate",
            "fieldType": "ZonedDateTime"
          },
          {
            "fieldName": "language",
            "fieldType": "Language",
            "fieldValues": "FRENCH,ENGLISH,SPANISH"
          }
        ]);
        expect(jobHistory.dto).to.eq('no');
        expect(jobHistory.service).to.eq('no');
        expect(jobHistory.pagination).to.eq('infinite-scroll');
        var job = JSON.parse(fs.readFileSync('.jhipster/Job.json', {encoding: 'utf-8'}));
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
  });
});

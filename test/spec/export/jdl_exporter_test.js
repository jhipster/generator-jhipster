'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  fs = require('fs'),
  readEntityJSON = require('../../../lib/reader/json_file_reader').readEntityJSON,
  Exporter = require('../../../lib/export/jdl_exporter'),
  JDLReader = require('../../../lib/reader/jdl_reader'),
  JDLParser = require('../../../lib/parser/jdl_parser'),
  EntityParser = require('../../../lib/parser/entity_parser'),
  parseFromDir = require('../../../lib/reader/json_reader').parseFromDir;

describe('::exportToJDL', function () {
  describe('when passing invalid parameters', function () {
    describe('such as undefined', function () {
      it('throws an error', function () {
        try {
          Exporter.exportToJDL();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when exporting json to entity JDL', function () {
      var jdl = parseFromDir('./test/test_files/jhipster_app');
      Exporter.exportToJDL(jdl);
      var input = JDLReader.parseFromFiles(['./jhipster-jdl.jh']);
      var entities_after = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      var entities_before = {};
      for (let entityName of ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task']) {
        entities_before[entityName] = readEntityJSON('./test/test_files/jhipster_app/.jhipster/' + entityName + '.json');
        entities_before[entityName].changelogDate = entities_after[entityName].changelogDate;
        if (entities_before[entityName].javadoc === undefined) {
          entities_before[entityName].javadoc = undefined;
        }
        // Sort arrays to ease comparison
        entities_before[entityName].fields.sort((f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        entities_after[entityName].fields.sort((f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        entities_before[entityName].relationships.sort((r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
        entities_after[entityName].relationships.sort((r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
      }
      it('exports it', function () {
        expect(fs.statSync('./jhipster-jdl.jh').isFile()).to.be.true;
        expect(entities_after).to.deep.eq(entities_before);
        // clean up the mess...
        fs.unlinkSync('./jhipster-jdl.jh');
      });
    });
  });
});

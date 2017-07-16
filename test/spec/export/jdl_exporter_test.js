

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const fs = require('fs');
const readEntityJSON = require('../../../lib/reader/json_file_reader').readEntityJSON;
const Exporter = require('../../../lib/export/jdl_exporter');
const JDLReader = require('../../../lib/reader/jdl_reader');
const JDLParser = require('../../../lib/parser/jdl_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const parseFromDir = require('../../../lib/reader/json_reader').parseFromDir;

describe('::exportToJDL', () => {
  describe('when passing invalid parameters', () => {
    describe('such as undefined', () => {
      it('throws an error', () => {
        try {
          Exporter.exportToJDL();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when exporting json to entity JDL', () => {
      const jdl = parseFromDir('./test/test_files/jhipster_app');
      Exporter.exportToJDL(jdl);
      const input = JDLReader.parseFromFiles(['./jhipster-jdl.jh']);
      const newEntities = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      const previousEntities = {};
      ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'].forEach((entityName) => {
        previousEntities[entityName] = readEntityJSON(`./test/test_files/jhipster_app/.jhipster/${entityName}.json`);
        previousEntities[entityName].changelogDate = newEntities[entityName].changelogDate;
        if (previousEntities[entityName].javadoc === undefined) {
          previousEntities[entityName].javadoc = undefined;
        }
        // Sort arrays to ease comparison
        previousEntities[entityName].fields.sort((f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        newEntities[entityName].fields.sort((f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        previousEntities[entityName].relationships.sort((r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
        newEntities[entityName].relationships.sort((r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
      });
      it('exports it', () => {
        expect(fs.statSync('./jhipster-jdl.jh').isFile()).to.be.true;
        expect(newEntities).to.deep.eq(previousEntities);
        // clean up the mess...
        fs.unlinkSync('./jhipster-jdl.jh');
      });
    });
  });
});

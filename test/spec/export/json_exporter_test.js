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
      });
    });
  });
});

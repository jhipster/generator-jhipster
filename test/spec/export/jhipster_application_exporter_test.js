const expect = require('chai').expect;
const fs = require('fs');
const Exporter = require('../../../lib/export/jhipster_application_exporter');
const JDLParser = require('../../../lib/parser/jdl_parser');
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

const fail = expect.fail;

describe('::exportApplications', () => {
  describe('when passing invalid parameters', () => {
    describe('such as undefined', () => {
      it('throws an error', () => {
        try {
          Exporter.exportApplications();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when exporting an application to JSON', () => {
      before(() => {
        Exporter.exportApplications(
          JDLParser.parse(
            parseFromFiles(['./test/test_files/application.jdl']), 'sql', 'monolith').applications);
      });
      after(() => {
        fs.unlinkSync('./test.json');
      });
      it('exports it', () => {
        fs.readFileSync('./test.json');
      });
    });
  });
});

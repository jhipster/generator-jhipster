'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  fs = require('fs'),
  Exporter = require('../../../lib/export/jhipster_application_exporter'),
  JDLParser = require('../../../lib/parser/jdl_parser'),
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

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

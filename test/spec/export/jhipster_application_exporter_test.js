'use strict';

const expect = require('chai').expect,
  fs = require('fs'),
  fail = expect.fail,
  Exporter = require('../../../lib/export/jhipster_application_exporter'),
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe.only('::exportApplications', () => {
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
      // const input = parseFromFiles(['./test/test_files/application.jdl']);
    });
  });
});

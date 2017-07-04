'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  Exporter = require('../../../lib/export/jhipster_application_exporter'),
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
      const parsed = parseFromFiles(['./test/test_files/application.jdl']);

      it('parses it', () => {
        expect(parsed).not.to.be.null;
        expect(parsed.applications.length).to.equal(1);
        expect(parsed.applications[0]).to.deep.equal({
          baseName: 'toto',
          path: '../../toto',
          packageFolder: 'com/mathieu/sample',
          packageName: 'com.mathieu.sample',
          enableTranslation: false,
          languages: ['en', 'fr']
        });
      });
    });
  });
});

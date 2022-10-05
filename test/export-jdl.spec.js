const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const { getTemplatePath, getGenerator } = require('./support/index.cjs');

describe('JHipster generator export jdl', () => {
  describe('exports entities to a JDL file without argument', () => {
    before(async () => {
      await helpers.run(getGenerator('export-jdl')).inTmpDir(dir => {
        fse.copySync(getTemplatePath('export-jdl'), dir);
      });
    });

    it('creates the jdl file based on app name', () => {
      assert.file('standard.jdl');
    });
  });

  describe('exports entities to a JDL file with file argument', () => {
    before(async () => {
      await helpers
        .run(getGenerator('export-jdl'))
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('export-jdl'), dir);
        })
        .withArguments('custom-app.jdl');
    });

    it('creates the jdl file', () => {
      assert.file('custom-app.jdl');
    });
  });
});

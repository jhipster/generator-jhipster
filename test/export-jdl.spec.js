const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

describe('JHipster generator export jdl', () => {
  describe('exports entities to a JDL file without argument', () => {
    before(async () => {
      await helpers.run(require.resolve('../generators/export-jdl/index.mjs')).inTmpDir(dir => {
        fse.copySync(path.join(__dirname, './templates/export-jdl'), dir);
      });
    });

    it('creates the jdl file based on app name', () => {
      assert.file('standard.jdl');
    });
  });

  describe('exports entities to a JDL file with file argument', () => {
    before(async () => {
      await helpers
        .run(require.resolve('../generators/export-jdl/index.mjs'))
        .inTmpDir(dir => {
          fse.copySync(path.join(__dirname, './templates/export-jdl'), dir);
        })
        .withArguments('custom-app.jdl');
    });

    it('creates the jdl file', () => {
      assert.file('custom-app.jdl');
    });
  });
});

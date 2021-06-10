const path = require('path');
const assert = require('yeoman-assert');
const { skipPrettierHelpers: helpers } = require('./utils/utils');

describe('JHipster init generator', () => {
  describe('generate init', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init')).withPrompts({
        baseName: 'jhipster',
      });
    });
    it('creates expected files for init generator', () => {
      assert.file('.editorconfig');
      assert.file('.gitattributes');
      assert.file('.gitignore');
      assert.file('.huskyrc');
      assert.file('.lintstagedrc.js');
      assert.file('package.json');
      assert.file('.prettierignore');
      assert.file('.prettierrc');
      assert.file('README.md');
      assert.file('.yo-rc.json');
    });
  });
});

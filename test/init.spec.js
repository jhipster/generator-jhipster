const path = require('path');
const assert = require('yeoman-assert');
const { skipPrettierHelpers: helpers } = require('./utils/utils');

describe('JHipster init generator', () => {
  describe('generate init', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init'));
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
  describe('generate init with default value', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init')).withPrompts({
        projectName: 'jhipster project',
        baseName: 'jhipster',
        prettierDefaultIndent: 2,
        prettierJavaIndent: 4,
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
  describe('generate init with different values', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init')).withPrompts({
        projectName: 'Beautiful Project',
        baseName: 'BeautifulProject',
        prettierDefaultIndent: 4,
        prettierJavaIndent: 2,
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

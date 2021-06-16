const path = require('path');
const assert = require('yeoman-assert');
const { skipPrettierHelpers: helpers } = require('./utils/utils');

describe('JHipster Maven generator', () => {
  describe('generate init', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init')).withPrompts({
        projectName: 'jhipster project',
        baseName: 'jhipster',
      });
      await helpers.run(path.join(__dirname, '../generators/maven')).withPrompts({
        packageName: 'tech.jhipster',
      });
    });
    it('creates expected files for init generator', () => {
      assert.file('.mvn/wrapper/maven-wrapper.jar');
      assert.file('.mvn/wrapper/maven-wrapper.properties');
      assert.file('.mvn/wrapper/MavenWrapperDownloader.java');
      assert.file('mvnw');
      assert.file('mvnw.cmd');
      assert.file('pom.xml');
    });
  });
});

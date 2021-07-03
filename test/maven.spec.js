const path = require('path');
const assert = require('yeoman-assert');
const { skipPrettierHelpers: helpers } = require('./utils/utils');

describe('JHipster Maven generator', () => {
  describe('with default package name', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init'));
      await helpers.run(path.join(__dirname, '../generators/maven'));
    });
    it('creates expected files for maven generator', () => {
      assert.file('.mvn/wrapper/maven-wrapper.jar');
      assert.file('.mvn/wrapper/maven-wrapper.properties');
      assert.file('.mvn/wrapper/MavenWrapperDownloader.java');
      assert.file('mvnw');
      assert.file('mvnw.cmd');
      assert.file('pom.xml');
    });
  });
  describe('with package name', () => {
    before(async () => {
      await helpers.run(path.join(__dirname, '../generators/init'));
      await helpers.run(path.join(__dirname, '../generators/maven')).withPrompts({
        packageName: 'tech.jhipster',
      });
    });
    it('creates expected files for maven generator', () => {
      assert.file('.mvn/wrapper/maven-wrapper.jar');
      assert.file('.mvn/wrapper/maven-wrapper.properties');
      assert.file('.mvn/wrapper/MavenWrapperDownloader.java');
      assert.file('mvnw');
      assert.file('mvnw.cmd');
      assert.file('pom.xml');
    });
  });
});

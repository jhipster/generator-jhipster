const path = require('path');

const { skipPrettierHelpers: helpers } = require('../utils/utils');

const mavenGeneratorPath = path.join(__dirname, '../../generators/maven');

describe('JHipster Maven generator', () => {
  describe('with default package name', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(mavenGeneratorPath);
    });
    it('creates expected files for maven generator', () => {
      runResult.assertFile('.mvn/wrapper/maven-wrapper.jar');
      runResult.assertFile('.mvn/wrapper/maven-wrapper.properties');
      runResult.assertFile('.mvn/wrapper/MavenWrapperDownloader.java');
      runResult.assertFile('mvnw');
      runResult.assertFile('mvnw.cmd');
      runResult.assertFile('pom.xml');
    });
  });
  describe('with package name', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(mavenGeneratorPath).withPrompts({
        packageName: 'tech.jhipster',
      });
    });
    it('creates expected files for maven generator', () => {
      runResult.assertFile('.mvn/wrapper/maven-wrapper.jar');
      runResult.assertFile('.mvn/wrapper/maven-wrapper.properties');
      runResult.assertFile('.mvn/wrapper/MavenWrapperDownloader.java');
      runResult.assertFile('mvnw');
      runResult.assertFile('mvnw.cmd');
      runResult.assertFile('pom.xml');
      runResult.assertFileContent('pom.xml', 'tech.jhipster');
    });
  });
});

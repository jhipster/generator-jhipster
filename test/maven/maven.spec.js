const path = require('path');
const expect = require('expect');

const { skipPrettierHelpers: helpers } = require('../utils/utils');

const mavenGeneratorPath = path.join(__dirname, '../../generators/maven');

describe('JHipster maven generator', () => {
  describe('with valid configuration', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(mavenGeneratorPath).withOptions({
        localConfig: {
          baseName: 'existing',
          packageName: 'tech.jhipster',
        },
      });
    });
    it('should create expected files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should add contents to pom.xml', () => {
      runResult.assertFileContent('pom.xml', 'existing');
      runResult.assertFileContent('pom.xml', 'tech.jhipster');
    });
  });
});

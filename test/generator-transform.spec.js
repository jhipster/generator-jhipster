const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const { copyTemplateBlueprints } = require('./utils/utils');
const EnvironmentBuilder = require('../cli/environment-builder');

describe('JHipster generator', () => {
  context('Default configuration with', () => {
    describe('Custom prettier', () => {
      before(() => {
        return helpers
          .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
          .inTmpDir(tmpdir => copyTemplateBlueprints(tmpdir, 'prettier-transform'))
          .withOptions({
            fromCli: true,
            skipInstall: true,
            baseName: 'jhipster',
            defaults: true,
            blueprints: 'prettier-transform',
          })
          .run();
      });

      it('writes custom .prettierrc', () => {
        assert.fileContent('.prettierrc', /tabWidth: 10/);
      });

      it('uses custom prettier formatting to java file', () => {
        assert.fileContent('src/main/java/com/mycompany/myapp/JhipsterApp.java', / {10}public JhipsterApp/);
      });
    });
  });
});

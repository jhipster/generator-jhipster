const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const EnvironmentBuilder = require('../../cli/environment-builder');

describe('JHipster application generator with blueprint with constructor error', () => {
  describe('generate monolith application with scoped blueprint', () => {
    it('rejects the environment', () => {
      return helpers
        .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
        .inTmpDir(dir => {
          // Fake the presence of the blueprint in node_modules
          const fakeBlueprintModuleDir = path.join(dir, 'node_modules', 'generator-jhipster-throwing-constructor');
          fse.ensureDirSync(fakeBlueprintModuleDir);
          fse.copySync(
            path.join(__dirname, '..', '..', 'test', 'templates', 'blueprints', 'generator-jhipster-throwing-constructor'),
            fakeBlueprintModuleDir
          );
        })
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          blueprints: 'generator-jhipster-throwing-constructor',
          baseName: 'jhipster',
          defaults: true,
        })
        .run()
        .then(
          () => assert.fail('should fail'),
          () => true
        );
    });
  });
});

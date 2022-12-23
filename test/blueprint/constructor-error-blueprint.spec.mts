import path, { dirname } from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

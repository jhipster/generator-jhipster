import path, { dirname } from 'path';
import assert from 'yeoman-assert';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import { basicHelpers as helpers } from '../support/index.mjs';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('generator - app - with blueprint with constructor error', () => {
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
        .withJHipsterConfig()
        .withOptions({
          blueprints: 'generator-jhipster-throwing-constructor',
        })
        .run()
        .then(
          () => assert.fail('should fail'),
          () => true
        );
    });
  });
});

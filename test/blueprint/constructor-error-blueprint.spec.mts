import assert from 'yeoman-assert';
import { basicHelpers as helpers } from '../support/index.mjs';
import { GENERATOR_APP } from '../../generators/generator-list.mjs';

describe('generator - app - with blueprint with constructor error', () => {
  describe('generate monolith application with scoped blueprint', () => {
    it('rejects the environment', () => {
      return helpers
        .runJHipster(GENERATOR_APP)
        .withFiles({
          'node_modules/generator-jhipster-throwing-constructor/package.json': {
            name: 'generator-jhipster-myblueprint',
            version: '9.9.9',
            type: 'module',
          },
          'node_modules/generator-jhipster-throwing-constructor/app/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    constructor(args, opts, features) {
      super(args, opts, features);
      throw new Error('blueprint with error');
    }
  };
};
`,
        })
        .withJHipsterConfig()
        .commitFiles()
        .withOptions({
          blueprints: 'generator-jhipster-throwing-constructor',
        })
        .then(
          () => assert.fail('should fail'),
          () => true
        );
    });
  });
});

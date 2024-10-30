import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { GENERATOR_APP } from '../generator-list.js';

const allMockedComposedGenerators = [
  'jhipster:common',
  'jhipster:languages',
  'jhipster:entities',
  'jhipster:entity',
  'jhipster:database-changelog',
  'jhipster:bootstrap',
  'jhipster:git',
  'jhipster:server',
  'jhipster:client',
];

describe('generator - app - composing', () => {
  describe('when mocking all generators', () => {
    describe('with default options', () => {
      before(async () => {
        await helpers.runJHipster(GENERATOR_APP).withJHipsterConfig().withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with server generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:server');
      });
      it('should compose with client generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:client');
      });
      it('should not compose with languages generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:languages');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });

    describe('with --skip-client', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipClient: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with server generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:server');
      });
      it('should not compose with client generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:client');
      });
      it('should not compose with languages generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:languages');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });

    describe('with --skip-server', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipServer: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should not compose with server generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:server');
      });
      it('should compose with client generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:client');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });
  });
});

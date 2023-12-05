import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'esmocha';

import { checkEnforcements, defaultHelpers as helpers, runResult } from '../../test/support/index.mjs';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.mjs';
import Generator from '../server/index.mjs';

import { GENERATOR_FEIGN_CLIENT } from '../generator-list.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe('generator - feign-client', () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs')).GENERATOR_FEIGN_CLIENT).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, GENERATOR_FEIGN_CLIENT);

  describe('with jwt', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_FEIGN_CLIENT).withJHipsterConfig({ authenticationType: 'jwt' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_FEIGN_CLIENT).withJHipsterConfig({ authenticationType: 'oauth2' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

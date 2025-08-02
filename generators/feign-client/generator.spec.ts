import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';
import { GENERATOR_FEIGN_CLIENT } from '../generator-list.ts';
import Generator from '../server/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe('generator - feign-client', () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts')).GENERATOR_FEIGN_CLIENT).toBe(generator);
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

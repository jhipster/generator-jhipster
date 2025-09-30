import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';
import Generator from '../server/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe('generator - feign-client', () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, generator);

  describe('with jwt', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'jwt' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'oauth2' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

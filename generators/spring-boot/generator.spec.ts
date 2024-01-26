import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import { snakeCase } from 'lodash-es';
import { checkEnforcements, defaultHelpers as helpers, runResult } from '../../test/support/index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from '../server/index.js';

import { mockedGenerators } from '../server/__test-support/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, generator);

  describe('with jwt', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'jwt' }).withMockedGenerators(mockedGenerators);
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'oauth2' }).withMockedGenerators(mockedGenerators);
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

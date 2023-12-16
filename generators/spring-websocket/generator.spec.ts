import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from './index.js';
import { defaultHelpers as helpers, result } from '../../test/support/index.js';

import { GENERATOR_SPRING_WEBSOCKET } from '../generator-list.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_SPRING_WEBSOCKET).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

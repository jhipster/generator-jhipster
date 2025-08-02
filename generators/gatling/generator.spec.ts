import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';

import { GENERATOR_GATLING } from '../generator-list.ts';
import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_GATLING).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot()).toMatchSnapshot();
    });
  });
  describe('with gradle build tool', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_GATLING).withJHipsterConfig({ buildTool: 'gradle' });
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot()).toMatchSnapshot();
    });
  });
});

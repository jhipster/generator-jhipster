import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { GENERATOR_GATLING } from '../generator-list.ts';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    const GENERATOR_LIST: Record<string, string> = await import('../generator-list.ts');
    await expect(GENERATOR_LIST[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
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

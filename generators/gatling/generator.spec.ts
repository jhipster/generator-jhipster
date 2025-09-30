import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot()).toMatchSnapshot();
    });
  });
  describe('with gradle build tool', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ buildTool: 'gradle' });
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot()).toMatchSnapshot();
    });
  });
});

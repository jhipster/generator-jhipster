import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';

import Generator from './index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.js';
import { defaultHelpers as helpers, result } from '../../../../testing/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = `${basename(resolve(__dirname, '../../'))}:${basename(__dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

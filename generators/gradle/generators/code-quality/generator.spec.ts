import { before, describe, expect, it } from 'esmocha';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { defaultHelpers as helpers, result } from '../../../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.js';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = `${basename(resolve(__dirname, '../../'))}:${basename(__dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with gradle build tool', () => {
    before(async () => {
      await helpers.runJHipster(generator).withGradleBuildTool();
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot('**/{build.gradle,buildSrc/**,gradle/libs.versions.toml}')).toMatchSnapshot();
    });
  });
});

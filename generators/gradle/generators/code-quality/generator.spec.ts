import { before, describe, expect, it } from 'esmocha';
import { basename, resolve } from 'node:path';

import { defaultHelpers as helpers, result } from '../../../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.ts';

import Generator from './index.ts';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

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

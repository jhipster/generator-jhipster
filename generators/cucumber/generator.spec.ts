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
      await helpers
        .runJHipster(generator)
        .onEnvironment(async env => {
          await env.composeWith('jhipster:maven');
        })
        .withJHipsterConfig({ testFrameworks: ['cucumber'] });
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot('**/pom.xml')).toMatchSnapshot();
    });
  });

  describe('with gradle build tool', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withFiles({
          'build.gradle': `
dependencies {
    // jhipster-needle-gradle-dependency
}
plugins {
    // jhipster-needle-gradle-plugins
}
`,
        })
        .onEnvironment(async env => {
          await env.composeWith('jhipster:gradle');
        })
        .withJHipsterConfig({ buildTool: 'gradle', testFrameworks: ['cucumber'] });
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot('**/{gradle/libs.versions.toml,build.gradle,buildSrc/**}')).toMatchSnapshot();
    });
  });
});

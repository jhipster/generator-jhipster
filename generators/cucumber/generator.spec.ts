import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { GENERATOR_CUCUMBER } from '../generator-list.ts';

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
      await helpers
        .runJHipster(GENERATOR_CUCUMBER)
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
        .runJHipster(GENERATOR_CUCUMBER)
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

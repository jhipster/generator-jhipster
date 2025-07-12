import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { defaultHelpers as helpers, result } from '../../lib/testing/index.js';

import Generator from './index.js';

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
      await helpers
        .runJHipster(generator)
        .onEnvironment(async env => {
          await env.composeWith('jhipster:maven');
          await env.composeWith('jhipster:spring-boot');
        })
        .withJHipsterConfig({ testFrameworks: ['cucumber'], skipClient: true });
    });

    it('should match files snapshot', () => {
      expect(result.getSnapshot('**/{pom.xml,junit-platform.properties}')).toMatchSnapshot();
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
          await env.composeWith('jhipster:spring-boot');
        })
        .withJHipsterConfig({ buildTool: 'gradle', testFrameworks: ['cucumber'], skipClient: true });
    });

    it('should match files snapshot', () => {
      expect(
        result.getSnapshot(
          '**/{gradle/libs.versions.toml,build.gradle,buildSrc/**,junit-platform.properties,gradle/profile_dev.gradle,gradle/profile_prod.gradle}',
        ),
      ).toMatchSnapshot();
    });
  });
});

import { before, describe, expect, it } from 'esmocha';
import { basename, join } from 'node:path';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import Generator from './generator.ts';

const generator = basename(import.meta.dirname);

process.env.CI = 'true';

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe(`with ng-default`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true })
        .withArguments('ng-default')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe(`with ng-default-additional (star jdl-entity)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true })
        .withArguments('ng-default-additional')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe(`with vue-default-additional (specific jdl-entity)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true })
        .withArguments('vue-default-additional')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe(`with ng-webflux-psql-additional (specific jdl-samples)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true })
        .withArguments('ng-webflux-psql-additional')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe(`with daily-builds/ngx-oauth2 (daily-builds sample)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true })
        .withArguments('ng-default')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

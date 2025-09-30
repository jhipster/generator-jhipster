import { before, describe, expect, it } from 'esmocha';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import Generator from './generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

process.env.CI = 'true';

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe(`with ng-default`, () => {
    before(async () => {
      await helpers.runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true }).withArguments('ng-default').withOptions({
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
        .runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true })
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
        .runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true })
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
        .runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true })
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
      await helpers.runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true }).withArguments('ng-default').withOptions({
        sampleOnly: true,
      });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, expect, it } from 'esmocha';
import { basename, join } from 'node:path';

import { defaultGithubEnvironment } from '../../lib/ci/index.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, runResult } from '#testing';

const generator = basename(import.meta.dirname);

process.env.CI = 'true';

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe(`with ng-default`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('the secrets of a sample', () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should be fixed for every generator of the sample, so it generates the same code each time', () => {
      expect(runResult.env.sharedOptions).toMatchObject({
        jwtSecretKey: process.env.JHI_JWT_SECRET_KEY ?? defaultGithubEnvironment['jwt-secret-key'],
        dbRandomPassword: 'sample-db-password',
      });
    });
  });

  describe(`with ng-default-additional (star jdl-entity)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default-additional')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe(`with ng-default-additional-playwright (star jdl-entity)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default-additional-playwright')
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
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
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
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-webflux-psql-additional')
        .withOptions({
          sampleOnly: true,
        });
    });

    it('should match matrix value', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with gradle-reactive(true), a group sample defined by a jdl', () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('gradle-reactive(true)')
        .withMockedGenerators(['jhipster:jdl', 'jhipster:info']);
    });

    it('should give the jdl inline to the jdl generator', () => {
      const [, options] = runResult.getGeneratorMock('jhipster:jdl').calls.at(-1)!.arguments;
      expect(options).toMatchObject({ inline: expect.stringContaining('graalvmSupport true') });
    });
  });

  describe('with ng-default-module-federation, a group sample generated from a .yo-rc.json folder', () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
        .withArguments('ng-default-module-federation')
        .withMockedGenerators(['jhipster:app', 'jhipster:info']);
    });

    it('should copy the .yo-rc.json of its folder and its entities', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { clientFramework: 'angular' } });
      runResult.assertFile('.jhipster/BankAccount.json');
    });

    it('should give its options to the app generator', () => {
      const [, options] = runResult.getGeneratorMock('jhipster:app').calls.at(-1)!.arguments;
      expect(options).toMatchObject({ auth: 'oauth2', microfrontend: true });
    });
  });

  describe(`with daily-builds/ngx-oauth2 (daily-builds sample)`, () => {
    before(async () => {
      await helpers
        .runJHipster(join(import.meta.dirname, 'index.ts'), { prepareEnvironment: true })
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

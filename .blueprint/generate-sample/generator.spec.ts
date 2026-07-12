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

import { shouldSupportFeatures } from '../../test/support/index.ts';

import Generator from './generator.ts';

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

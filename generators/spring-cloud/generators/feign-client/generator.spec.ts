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
import { basename, resolve } from 'node:path';

import Generator from './index.ts';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, runResult } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - feign-client`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, generator);

  describe('with jwt', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'jwt' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ authenticationType: 'oauth2' });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

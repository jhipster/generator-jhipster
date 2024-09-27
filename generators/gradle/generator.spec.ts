/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { testBlueprintSupport } from '../../test/support/tests.js';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { GENERATOR_JHIPSTER } from '../generator-constants.js';
import { GENERATOR_GRADLE } from '../generator-list.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_GRADLE).toBe(generator);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with valid configuration', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({
        baseName: 'existing',
        packageName: 'tech.jhipster',
      });
    });
    it('should generate only gradle files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'gradle' } });
    });
  });
  describe('with empty configuration', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig();
    });
    it('should generate only gradle files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'gradle' } });
    });
  });

  describe('with custom gradleVersion', () => {
    const gradleVersion = 'fooVersion';
    before(async () => {
      await helpers.runJHipster(generator).withSharedApplication({ gradleVersion }).withJHipsterConfig();
    });
    it('should set gradleVersion at gradle-wrapper.properties', () => {
      runResult.assertFileContent('gradle/wrapper/gradle-wrapper.properties', `-${gradleVersion}-`);
    });
  });
});

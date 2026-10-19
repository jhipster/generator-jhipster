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
import { before, describe, expect, it } from 'expect-node';
import { basename, resolve } from 'node:path';

import Generator from './index.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators({ except: ['jhipster:common', 'jhipster:javascript-simple-application'] })
        .withJHipsterConfig();
    });

    it('should write the e2e scripts and their dependencies to the root package.json', () => {
      expect(JSON.parse(result.getSnapshot()['package.json'].contents!)).toMatchObject({
        scripts: { 'e2e:dev': expect.any(String), 'ci:e2e:dev': expect.any(String), 'pree2e:headless': expect.any(String) },
        devDependencies: { concurrently: expect.any(String), 'wait-on': expect.any(String) },
      });
      result.assertNoJsonFileContent('package.json', { scripts: { 'e2e:headless': {} } });
    });
  });

  describe('with a client workspace', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators({ except: ['jhipster:common', 'jhipster:javascript-simple-application'] })
        .withSharedApplication({ clientRootDir: 'client/' })
        .withJHipsterConfig();
    });

    it('should run the e2e tests from the client workspace', () => {
      result.assertJsonFileContent('package.json', { scripts: { 'e2e:headless': 'npm run -w client/ e2e:headless' } });
    });
  });
});

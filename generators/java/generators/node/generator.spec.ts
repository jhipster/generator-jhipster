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

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig().withMockedJHipsterGenerators().withMockedSource();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:java-simple-application:build-tool",
]
`);
    });
  });

  describe('with gradle build tool', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig().withMockedJHipsterGenerators().withMockedSource().withGradleBuildTool();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:java-simple-application:build-tool",
]
`);
    });
  });

  describe('with pnpm', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ nodePackageManager: 'pnpm' })
        .withFiles({ npmw: '', 'npmw.cmd': '' })
        .withMockedJHipsterGenerators()
        .withMockedSource();
    });

    it('should write the pnpm wrapper in place of the npm one', () => {
      result.assertFile(['pnpmw', 'pnpmw.cmd']);
      result.assertNoFile(['npmw', 'npmw.cmd']);
    });
  });

  for (const [clientFramework, testResult, coverage] of [
    ['angular', 'TESTS-results-sonar-vitest.xml', 'outputs.file("build/test-results/lcov.info")'],
    ['react', 'TESTS-results-vitest.xml', 'outputs.dir("build/test-results/lcov-report/")'],
    ['vue', 'TESTS-results-vitest.xml', 'outputs.dir("build/vite-coverage/")'],
  ] as const) {
    describe(`with gradle build tool and ${clientFramework}`, () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({ clientFramework })
          .withMockedJHipsterGenerators()
          .withMockedSource()
          .withGradleBuildTool();
      });

      it('should declare the files written by Vitest as webapp_test outputs', () => {
        const file = 'buildSrc/src/main/groovy/jhipster.node-gradle-conventions.gradle';
        result.assertFileContent(file, `outputs.file("build/test-results/${testResult}")`);
        result.assertFileContent(file, coverage);
        result.assertNoFileContent(file, 'TESTS-results-jest.xml');
      });
    });
  }
});

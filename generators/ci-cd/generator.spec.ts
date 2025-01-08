/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/helpers.js';
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

  describe('cli', () => {
    describe('without ciCd values', () => {
      before(async () => {
        await helpers.runCli('ci-cd').withJHipsterConfig().withSkipWritingPriorities();
      });

      it('should match prompts order', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "ciCd",
  "ciCdIntegrations",
]
`);
      });
    });

    describe('with invalid ciCd value', () => {
      it('should exit with error', async () => {
        await expect(
          helpers.runCli('ci-cd foo').withJHipsterConfig().withSkipWritingPriorities(),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"error: command-argument value 'foo' is invalid for argument 'ciCd'. Allowed choices are github, jenkins, gitlab, azure, travis, circle."`,
        );
      });
    });

    describe('with multiples values', () => {
      before(async () => {
        const deploymentConfig = {
          ciCdIntegrations: ['deploy', 'sonar'],
        };
        await helpers
          .runCli('ci-cd github jenkins gitlab azure')
          // @ts-ignore
          .withJHipsterConfig(deploymentConfig as any)
          .withSkipWritingPriorities();
      });

      it('should match context snapshot', () => {
        expect(runResult.application).toMatchSnapshot({
          user: expect.any(Object),
          authority: expect.any(Object),
          userManagement: expect.any(Object),
          jhipsterPackageJson: expect.any(Object),
          javaDependencies: expect.any(Object),
          dockerContainers: expect.any(Object),
        });
      });
      it('should populate context', () => {
        expect(runResult.application!.ciCd).toEqual(['github', 'jenkins', 'gitlab', 'azure']);
      });
    });

    describe('with github', () => {
      before(async () => {
        await helpers.runCli('ci-cd github').withJHipsterConfig().withSkipWritingPriorities();
      });

      it('should not ask ciCd question', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "ciCdIntegrations",
]
`);
      });
    });

    describe('with jenkins', () => {
      before(async () => {
        await helpers.runCli('ci-cd jenkins').withJHipsterConfig().withSkipWritingPriorities();
      });

      it('should not ask ciCd question', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "ciCdIntegrations",
  "insideDocker",
  "sendBuildToGitlab",
]
`);
      });
    });
  });
});

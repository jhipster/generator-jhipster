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
import { before, describe, it } from 'esmocha';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';

import Generator from './generator.ts';

const { PLAYWRIGHT } = testFrameworkTypes;
const { ANGULAR } = clientFrameworkTypes;

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator, { skipSbsBlueprint: true }));
  checkEnforcements({ client: true }, generator);

  describe('with default client root', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({
        authenticationType: 'jwt',
        clientFramework: ANGULAR,
        testFrameworks: [PLAYWRIGHT],
      });
    });

    it('contains playwright testFramework', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [PLAYWRIGHT] } });
    });

    it('writes Playwright config and account smoke tests', () => {
      runResult.assertFile([
        'playwright.config.ts',
        'src/test/javascript/playwright/e2e/account/login-page.spec.ts',
        'src/test/javascript/playwright/e2e/account/logout.spec.ts',
        'src/test/javascript/playwright/support/login.ts',
        'src/test/javascript/playwright/support/selectors.ts',
        'src/test/javascript/playwright/tsconfig.json',
      ]);
    });

    it('guards the Playwright README fragment sections', () => {
      const readmeTemplate = readFileSync(join(import.meta.dirname, 'templates/README.md.jhi.playwright.ejs'), 'utf-8');
      assert.match(readmeTemplate, /fragment\.testingSection/);
      assert.match(readmeTemplate, /fragment\.referenceSection/);
    });

    it('guards the Playwright tsconfig root options', () => {
      const tsconfigTemplate = readFileSync(
        join(import.meta.dirname, 'templates/src/test/javascript/playwright/tsconfig.json.ejs'),
        'utf-8',
      );
      assert.match(tsconfigTemplate, /clientFrameworkReact/);
      assert.match(tsconfigTemplate, /"rootDir": null/);
      assert.match(tsconfigTemplate, /clientFrameworkAngular/);
      assert.match(tsconfigTemplate, /playwright\/tsc/);
    });

    it('adds Playwright dependencies and scripts', () => {
      runResult.assertJsonFileContent('package.json', {
        devDependencies: {
          '@playwright/test': 'PLAYWRIGHT_TEST_VERSION',
          'eslint-plugin-playwright': 'ESLINT_PLUGIN_PLAYWRIGHT_VERSION',
        },
        scripts: {
          playwright: 'playwright test --ui',
          'e2e:playwright': 'playwright test',
          'e2e:playwright:devserver': 'playwright test',
          'e2e:headless': 'npm run e2e:playwright --',
        },
      });
      runResult.assertFileContent('playwright.config.ts', "const devServerBaseURL = 'http://localhost:4200/';");
      runResult.assertFileContent('playwright.config.ts', "process.env.npm_lifecycle_event === 'e2e:playwright:devserver'");
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({
        authenticationType: 'oauth2',
        clientFramework: ANGULAR,
        testFrameworks: [PLAYWRIGHT],
      });
    });

    it('skips the first-pass account specs', () => {
      runResult.assertNoFile([
        'src/test/javascript/playwright/e2e/account/login-page.spec.ts',
        'src/test/javascript/playwright/e2e/account/logout.spec.ts',
      ]);
    });
  });
});

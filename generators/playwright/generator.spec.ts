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
import { basename } from 'node:path';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import { AuthenticationTypeMatrix, defaultHelpers as helpers, extendMatrix, fromMatrix, runResult } from '../../lib/testing/index.ts';
import type { ConfigAll } from '../../lib/types/command-all.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';

import Generator from './generator.ts';

const { PLAYWRIGHT } = testFrameworkTypes;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;

const generator = basename(import.meta.dirname);

const e2eMatrix = extendMatrix<ConfigAll>(
  fromMatrix({
    ...AuthenticationTypeMatrix,
  }),
  {
    clientFramework: [ANGULAR, REACT, VUE],
    withAdminUi: [false, true],
    clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
  },
);

const e2eSamples = Object.fromEntries(
  Object.entries(e2eMatrix).map(([name, sample]) => [
    name,
    {
      ...sample,
      testFrameworks: [PLAYWRIGHT],
    },
  ]),
);

const entities = [
  {
    name: 'EntityA',
    changelogDate: '20220129025419',
  },
];

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, generator);

  it('samples matrix should match snapshot', () => {
    expect(e2eSamples).toMatchSnapshot();
  });

  Object.entries(e2eSamples).forEach(([name, sampleConfig]) => {
    describe(name, () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(sampleConfig, entities);
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      it('contains playwright testFramework', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [PLAYWRIGHT] } });
      });

      describe('withAdminUi', () => {
        const { applicationType, withAdminUi, clientRootDir = '' } = sampleConfig;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          const playwrightAdminRoot = clientRootDir ? `${clientRootDir}test/` : 'src/test/javascript/';
          it(adminUiRoutingTitle, () => {
            const assertion = (...args: [string, string | RegExp]) =>
              generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args);

            assertion(
              `${playwrightAdminRoot}playwright/e2e/administration/administration.spec.ts`,
              '  metricsPageHeadingSelector,\n' +
                '  healthPageHeadingSelector,\n' +
                '  logsPageHeadingSelector,\n' +
                '  configurationPageHeadingSelector,',
            );

            assertion(
              `${playwrightAdminRoot}playwright/e2e/administration/administration.spec.ts`,
              "  test.describe('/metrics', () => {\n" +
                "    test('should load the page', async ({ page }) => {\n" +
                "      await clickOnAdminMenuItem(page, 'metrics');\n" +
                '      await expect(page.locator(metricsPageHeadingSelector)).toBeVisible();\n' +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  test.describe('/health', () => {\n" +
                "    test('should load the page', async ({ page }) => {\n" +
                "      await clickOnAdminMenuItem(page, 'health');\n" +
                '      await expect(page.locator(healthPageHeadingSelector)).toBeVisible();\n' +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  test.describe('/logs', () => {\n" +
                "    test('should load the page', async ({ page }) => {\n" +
                "      await clickOnAdminMenuItem(page, 'logs');\n" +
                '      await expect(page.locator(logsPageHeadingSelector)).toBeVisible();\n' +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  test.describe('/configuration', () => {\n" +
                "    test('should load the page', async ({ page }) => {\n" +
                "      await clickOnAdminMenuItem(page, 'configuration');\n" +
                '      await expect(page.locator(configurationPageHeadingSelector)).toBeVisible();\n' +
                '    });\n' +
                '  });',
            );

            assertion(
              `${playwrightAdminRoot}playwright/support/commands.ts`,
              'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
                'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
                'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
                'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';',
            );
          });
        }
      });
    });
  });
});

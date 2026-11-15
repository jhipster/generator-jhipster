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
import { basename } from 'node:path';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';

import Generator from './generator.ts';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { AuthenticationTypeMatrix, type Matrix, defaultHelpers as helpers, extendMatrix, fromMatrix, runResult } from '#testing';

const { PLAYWRIGHT } = testFrameworkTypes;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;

const generator = basename(import.meta.dirname);

const e2eMatrix: Matrix = extendMatrix(fromMatrix({ ...AuthenticationTypeMatrix }), {
  clientFramework: [ANGULAR, REACT, VUE],
  withAdminUi: [false, true],
  clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
});

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

  describe('translations', () => {
    const translationsSpec = 'src/test/javascript/playwright/e2e/translation/translations.pw.ts';
    const config = { clientFramework: VUE, testFrameworks: [PLAYWRIGHT] };
    const gatewayConfig = {
      ...config,
      applicationType: 'gateway' as const,
      baseName: 'gateway',
      microfrontends: [{ baseName: 'blog' }],
    };

    describe('with more than one language', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, languages: ['en', 'pt-br'] });
      });

      it('should check the welcome of the other language', () => {
        runResult.assertFileContent(translationsSpec, 'i18n/pt-br/home.json');
        runResult.assertFileContent(translationsSpec, '[data-cy="language-pt-br"]');
      });
    });

    describe('with one language', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, languages: ['en'] });
      });

      it('should not write the spec', () => {
        runResult.assertNoFile(translationsSpec);
      });
    });

    describe('with a microfrontend', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(gatewayConfig);
      });

      it('should not check another language', () => {
        runResult.assertNoFileContent(translationsSpec, 'languageMenuSelector');
      });

      it('should check the application title once the microfrontend is loaded', () => {
        runResult.assertFileContent(translationsSpec, '.dropdown-item[href^="/blog/"]');
        runResult.assertFileContent(translationsSpec, ".toHaveText('Gateway')");
        runResult.assertFileContent(translationsSpec, 'test.describe.configure({ retries: 0 })');
      });
    });

    describe('with a microfrontend and another language', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...gatewayConfig, languages: ['en', 'pt-br'] });
      });

      it('should check the translations of the microfrontend in that language', () => {
        runResult.assertFileContent(translationsSpec, 'should load the blog translations of another language');
        runResult.assertFileContent(translationsSpec, '[data-cy="language-pt-br"]');
      });
    });

    describe('without translations', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...gatewayConfig, enableTranslation: false, languages: ['en', 'pt-br'] });
      });

      it('should not write the spec', () => {
        runResult.assertNoFile(translationsSpec);
      });
    });
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

      it('should generate the entity spec', () => {
        const { clientRootDir = '' } = sampleConfig;
        const playwrightRoot = clientRootDir ? `${clientRootDir}test/` : 'src/test/javascript/';
        runResult.assertFileContent(`${playwrightRoot}playwright/e2e/entity/entity-a.pw.ts`, "test.describe('EntityA e2e test'");
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
              `${playwrightAdminRoot}playwright/e2e/administration/administration.pw.ts`,
              '  metricsPageHeadingSelector,\n' +
                '  healthPageHeadingSelector,\n' +
                '  logsPageHeadingSelector,\n' +
                '  configurationPageHeadingSelector,',
            );

            assertion(
              `${playwrightAdminRoot}playwright/e2e/administration/administration.pw.ts`,
              "  test.describe('/metrics', () => {\n" +
                "    test('should load the page', async ({ page, jhi }) => {\n" +
                "      await jhi.navbar.clickOnAdminMenuItem('admin/metrics');\n" +
                '      await expect(page.locator(metricsPageHeadingSelector)).toBeVisible();\n' +
                '    });\n' +
                '  });',
            );
          });
        }
      });
    });
  });
});

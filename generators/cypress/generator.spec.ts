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
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { setModifiedFileState } from 'mem-fs-editor/state';
import { transform } from 'p-transform';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import { createESLintTransform } from '../bootstrap/support/eslint-transform.ts';

import Generator from './generator.ts';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { AuthenticationTypeMatrix, type Matrix, defaultHelpers as helpers, extendMatrix, fromMatrix, runResult } from '#testing';

const { CYPRESS } = testFrameworkTypes;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;

const generator = basename(import.meta.dirname);

const e2eMatrix: Matrix = extendMatrix(
  fromMatrix({
    ...AuthenticationTypeMatrix,
    cypressAudit: [false, true],
  }),
  {
    clientFramework: [ANGULAR, REACT, VUE],
    withAdminUi: [false, true],
    cypressCoverage: [false, true],
    clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
  },
);

const e2eSamples = Object.fromEntries(
  Object.entries(e2eMatrix).map(([name, sample]) => [
    name,
    {
      ...sample,
      testFrameworks: [CYPRESS],
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

  describe('eslint.config.ts of an Angular application', () => {
    before(async () => {
      await helpers.runJHipster('app').withJHipsterConfig({ clientFramework: ANGULAR, skipServer: true, testFrameworks: [CYPRESS] });
    });

    it('should import typescript-eslint once after eslint fixes the imports of the templates', async () => {
      // The Angular and the Cypress templates both import typescript-eslint, eslint merges them while it orders the imports.
      const file = { path: 'eslint.config.ts', contents: Buffer.from(runResult.fs.read(`${runResult.cwd}/eslint.config.ts`)) };
      expect(file.contents.toString().match(/^import tseslint from 'typescript-eslint';$/gm)).toHaveLength(2);
      setModifiedFileState(file);
      await pipeline(
        Readable.from([file]),
        await createESLintTransform(),
        transform(() => undefined),
      );
      expect(file.contents.toString().match(/^import tseslint from 'typescript-eslint';$/gm)).toHaveLength(1);
    });
  });

  describe('language', () => {
    const translationsSpec = 'src/test/javascript/cypress/e2e/translation/translations.cy.ts';
    const config = { clientFramework: VUE, testFrameworks: [CYPRESS] };

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

    describe('without translations', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, enableTranslation: false, languages: ['en', 'pt-br'] });
      });

      it('should not write the spec', () => {
        runResult.assertNoFile(translationsSpec);
      });
    });
  });

  describe('microfrontend translations', () => {
    const translationsSpec = 'src/test/javascript/cypress/e2e/translation/translations.cy.ts';
    const config = {
      applicationType: 'gateway' as const,
      baseName: 'gateway',
      clientFramework: VUE,
      microfrontends: [{ baseName: 'blog' }],
      testFrameworks: [CYPRESS],
    };

    describe('with a microfrontend', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(config);
      });

      it('should not check another language', () => {
        runResult.assertNoFileContent(translationsSpec, 'languageMenuSelector');
      });

      it('should check the application title once the microfrontend is loaded', () => {
        runResult.assertFileContent(translationsSpec, '.dropdown-item[href^="/blog/"]');
        runResult.assertFileContent(translationsSpec, ".should('have.text', 'Gateway')");
        runResult.assertFileContent(translationsSpec, '{ retries: 0 }');
      });
    });

    describe('without translations', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, enableTranslation: false });
      });

      it('should not write the spec', () => {
        runResult.assertNoFile(translationsSpec);
      });
    });

    describe('with another language', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, languages: ['en', 'pt-br'] });
      });

      it('should check the translations of the microfrontend in that language', () => {
        runResult.assertFileContent(translationsSpec, 'should load the blog translations of another language');
        runResult.assertFileContent(translationsSpec, '[data-cy="language-pt-br"]');
      });
    });

    describe('without microfrontends', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({ ...config, microfrontends: [] });
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

      it('contains cypress testFramework', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });

      describe('withAdminUi', () => {
        const { applicationType, withAdminUi, clientRootDir = '' } = sampleConfig;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          const cypressAdminRoot = clientRootDir ? `${clientRootDir}test/` : 'src/test/javascript/';
          it(adminUiRoutingTitle, () => {
            const assertion = (...args: [string, string | RegExp]) =>
              generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args);

            assertion(
              `${cypressAdminRoot}cypress/e2e/administration/administration.cy.ts`,
              '  metricsPageHeadingSelector,\n' +
                '  healthPageHeadingSelector,\n' +
                '  logsPageHeadingSelector,\n' +
                '  configurationPageHeadingSelector,',
            );

            assertion(
              `${cypressAdminRoot}cypress/e2e/administration/administration.cy.ts`,
              "  describe('/metrics', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('admin/metrics');\n" +
                "      cy.get(metricsPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/health', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('admin/health');\n" +
                "      cy.get(healthPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/logs', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('admin/logs');\n" +
                "      cy.get(logsPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/configuration', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('admin/configuration');\n" +
                "      cy.get(configurationPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });',
            );

            assertion(
              `${cypressAdminRoot}cypress/support/commands.ts`,
              'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
                'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
                'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
                'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';',
            );
          });
        }
      });

      it('keeps backend wait before root headless e2e for workspace clients', () => {
        const { clientRootDir } = sampleConfig;
        if (!clientRootDir) {
          return;
        }

        runResult.assertJsonFileContent('package.json', {
          scripts: {
            'pree2e:headless': 'npm run ci:server:await --if-present',
            'e2e:headless': `npm run -w ${clientRootDir} e2e:headless`,
          },
        });
      });
    });
  });
});

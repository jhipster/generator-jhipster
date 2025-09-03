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
import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import {
  AuthenticationTypeMatrix,
  type Matrix,
  defaultHelpers as helpers,
  extendMatrix,
  fromMatrix,
  runResult,
} from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';

import Generator from './generator.ts';

const { CYPRESS } = testFrameworkTypes;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const e2eMatrix = extendMatrix(
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

const e2eSamples: Matrix = Object.fromEntries(
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
            const assertion = (...args: any[]) =>
              generateAdminUi ? (runResult.assertFileContent as any)(...args) : (runResult.assertNoFileContent as any)(...args);

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
                "      cy.clickOnAdminMenuItem('metrics');\n" +
                "      cy.get(metricsPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/health', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('health');\n" +
                "      cy.get(healthPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/logs', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('logs');\n" +
                "      cy.get(logsPageHeadingSelector).should('be.visible');\n" +
                '    });\n' +
                '  });\n' +
                '\n' +
                "  describe('/configuration', () => {\n" +
                "    it('should load the page', () => {\n" +
                "      cy.clickOnAdminMenuItem('configuration');\n" +
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
    });
  });
});

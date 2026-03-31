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
import type { Entity } from '../../lib/jhipster/types/entity.ts';
import type { Matrix } from '../../lib/testing/index.ts';
import { AuthenticationTypeMatrix, defaultHelpers as helpers, extendMatrix, fromMatrix, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';

import Generator from './generator.ts';

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
const jsonBlobEntity = {
  name: 'JsonBlob',
  changelogDate: '20220129025420',
  fields: [{ fieldName: 'payload', fieldType: 'byte[]', fieldTypeBlobContent: 'json' }],
} satisfies Entity;

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
    });
  });

  describe('json blob content type', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig(
        {
          applicationType: 'monolith',
          authenticationType: 'jwt',
          clientFramework: ANGULAR,
          testFrameworks: [CYPRESS],
          withAdminUi: false,
          cypressAudit: false,
          cypressCoverage: false,
          nativeLanguage: 'en',
          languages: ['en'],
        },
        [jsonBlobEntity],
      );
    });

    it('should type json blobs instead of uploading them as files', () => {
      const cypressEntityFile = 'src/test/javascript/cypress/e2e/entity/json-blob.cy.ts';
      runResult.assertFileContent(cypressEntityFile, 'cy.get(`[data-cy="payload"]`).type(');
      runResult.assertNoFileContent(cypressEntityFile, "cy.setFieldImageAsBytesOfEntity('payload'");
    });
  });
});

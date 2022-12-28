/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import path, { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { clientFrameworkTypes, testFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { fromMatrix, extendMatrix, AuthenticationTypeMatrix } from '../../test/support/index.mjs';
import { testBlueprintSupport } from '../../test/support/tests.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import Generator from './generator.mjs';
import { CLIENT_TEST_SRC_DIR } from '../generator-constants.mjs';

const { CYPRESS } = testFrameworkTypes;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;
const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const generatorPath = path.join(__dirname, 'index.mts');

const e2eMatrix = extendMatrix(
  fromMatrix({
    ...AuthenticationTypeMatrix,
    cypressAudit: [false, true],
  }),
  {
    clientFramework: [ANGULAR, REACT, VUE],
    withAdminUi: [false, true],
    cypressCoverage: [false, true],
    clientSrcDir: [
      undefined,
      { value: 'src/', additional: { clientTestDir: 'test/' } },
      { value: 'src/main/webapp2/', additional: { clientTestDir: 'src/test/javascript2/' } },
    ],
  }
);

const testSamples = () =>
  Object.entries(e2eMatrix).map(([name, sample]) => [
    name,
    {
      skipInstall: true,
      applicationWithEntities: {
        config: {
          ...sample,
          baseName: 'jhipster',
          testFrameworks: [CYPRESS],
        },
        entities: [
          {
            name: 'EntityA',
            changelogDate: '20220129025419',
          },
        ],
      },
    },
  ]);

const e2eSamples = testSamples();

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  it('samples matrix should match snapshot', () => {
    expect(Object.fromEntries(e2eSamples)).toMatchSnapshot();
  });

  e2eSamples.forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers.create(generatorPath).withOptions(sample).run();
      });

      after(() => runResult.cleanup());

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      it('contains cypress testFramework', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });

      describe('withAdminUi', () => {
        const { applicationType, withAdminUi, clientTestDir = CLIENT_TEST_SRC_DIR } = sampleConfig;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          it(adminUiRoutingTitle, () => {
            const assertion = (...args) =>
              generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args);

            assertion(
              `${clientTestDir}cypress/e2e/administration/administration.cy.ts`,
              '  metricsPageHeadingSelector,\n' +
                '  healthPageHeadingSelector,\n' +
                '  logsPageHeadingSelector,\n' +
                '  configurationPageHeadingSelector,'
            );

            assertion(
              `${clientTestDir}cypress/e2e/administration/administration.cy.ts`,
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
                '  });'
            );

            assertion(
              `${clientTestDir}cypress/support/commands.ts`,
              'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
                'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
                'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
                'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
            );
          });
        }
      });
    });
  });
});

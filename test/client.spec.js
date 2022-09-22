const assert = require('yeoman-assert');
const { CYPRESS } = require('../jdl/jhipster/test-framework-types');
const { ANGULAR } = require('../jdl/jhipster/client-framework-types');
const { skipPrettierHelpers: helpers } = require('./utils/utils');
const constants = require('../generators/generator-constants');
const { appDefaultConfig } = require('../generators/generator-defaults');

const { CLIENT_TEST_SRC_DIR } = constants;

describe('JHipster client generator', () => {
  describe('Admin UI', () => {
    describe('selected and Angular', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(require.resolve('../generators/client'))
          .withOptions({
            defaultLocalConfig: { ...appDefaultConfig, clientFramework: ANGULAR, testFrameworks: ['cypress'] },
          })
          .run();
      });

      after(() => runResult.cleanup());

      it('should contains admin ui cypress tests', () => {
        assert.fileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/e2e/administration/administration.cy.ts`,
          '  metricsPageHeadingSelector,\n' +
            '  healthPageHeadingSelector,\n' +
            '  logsPageHeadingSelector,\n' +
            '  configurationPageHeadingSelector,'
        );

        assert.fileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/e2e/administration/administration.cy.ts`,
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

        assert.fileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
          'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
            'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
            'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
            'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
        );
      });
    });

    describe('not selected and Angular', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(require.resolve('../generators/client'))
          .withOptions({
            defaultLocalConfig: {
              ...appDefaultConfig,
              clientFramework: ANGULAR,
              testFrameworks: [CYPRESS],
              withAdminUi: false,
            },
          })
          .run();
      });

      after(() => runResult.cleanup());

      it('should not contains admin ui cypress tests', () => {
        assert.noFileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/e2e/administration/administration.cy.ts`,
          '  metricsPageHeadingSelector,\n' +
            '  healthPageHeadingSelector,\n' +
            '  logsPageHeadingSelector,\n' +
            '  configurationPageHeadingSelector,'
        );

        assert.noFileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/e2e/administration/administration.cy.ts`,
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

        assert.noFileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
          'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
            'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
            'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
            'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
        );
      });
    });
  });
});

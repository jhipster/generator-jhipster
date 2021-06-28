const expect = require('expect');
const path = require('path');
const assert = require('yeoman-assert');

const { skipPrettierHelpers: helpers, getFilesForOptions } = require('./utils/utils');
const expectedFiles = require('./utils/expected-files');
const reactFiles = require('../generators/client/files-react').files;
const constants = require('../generators/generator-constants');
const { appDefaultConfig } = require('../generators/generator-defaults');
const {
  SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR, REACT, VUE },
} = require('../generators/generator-constants');

const { CLIENT_TEST_SRC_DIR, CLIENT_MAIN_SRC_DIR } = constants;

describe('JHipster client generator', () => {
  describe('generate client with React', () => {
    before(async () => {
      await helpers
        .run(path.join(__dirname, '../generators/client'))
        .withOptions({ skipInstall: true, auth: 'jwt', experimental: true })
        .withPrompts({
          baseName: 'jhipster',
          serviceDiscoveryType: false,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr', 'en'],
          clientFramework: REACT,
        });
    });
    it('creates expected files for react configuration for client generator', () => {
      assert.noFile(expectedFiles.maven);
      assert.file(expectedFiles.clientCommon);
      assert.file(
        getFilesForOptions(reactFiles, {
          enableTranslation: true,
          serviceDiscoveryType: false,
          authenticationType: 'jwt',
          testFrameworks: [],
        })
      );
    });
    it('contains clientFramework with react value', () => {
      assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
    });
    it('should not contain version placeholders at package.json', () => {
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_COMMON/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_REACT/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_VUE/);
    });
  });

  describe('generate client with Angular', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(path.join(__dirname, '../generators/client'))
        .withOptions({ skipInstall: true, auth: 'jwt' })
        .withPrompts({
          baseName: 'jhipster',
          serviceDiscoveryType: false,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr', 'en'],
          clientFramework: ANGULAR,
        });
    });

    it('creates expected files for default configuration for client generator', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('contains clientFramework with angularX value', () => {
      assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
    });
    it('contains clientPackageManager with npm value', () => {
      assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
    });
    it('should not contain version placeholders at package.json', () => {
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_COMMON/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_REACT/);
      assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_VUE/);
    });
  });

  describe('--skip-jhipster-dependencies', () => {
    [ANGULAR, REACT, VUE].forEach(clientFramework => {
      describe(`and ${clientFramework}`, () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .create(require.resolve('../generators/app'))
            .withOptions({
              defaultLocalConfig: { ...appDefaultConfig, clientFramework, skipServer: true },
              skipJhipsterDependencies: true,
            })
            .run();
        });

        after(() => runResult.cleanup());

        it('should add clientFramework to .yo-rc.json', () => {
          runResult.assertFileContent('.yo-rc.json', `"clientFramework": "${clientFramework}"`);
        });
        it('should not add generator-jhipster to package.json', () => {
          runResult.assertNoFileContent('package.json', 'generator-jhipster');
        });
      });
    });
  });

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

      it('should have admin ui components', () => {
        runResult.assertFile(expectedFiles.clientAdminAngular);
      });

      it('should contains admin routing', () => {
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
          `
      {
        path: 'configuration',
        loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule),
      },
      {
        path: 'health',
        loadChildren: () => import('./health/health.module').then(m => m.HealthModule),
      },
      {
        path: 'logs',
        loadChildren: () => import('./logs/logs.module').then(m => m.LogsModule),
      },
      {
        path: 'metrics',
        loadChildren: () => import('./metrics/metrics.module').then(m => m.MetricsModule),
      },
`
        );
      });

      it('should contains admin ui cypress tests', () => {
        assert.fileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
          '  metricsPageHeadingSelector,\n' +
            '  healthPageHeadingSelector,\n' +
            '  logsPageHeadingSelector,\n' +
            '  configurationPageHeadingSelector,'
        );

        assert.fileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
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
              testFrameworks: ['cypress'],
              withAdminUi: false,
            },
          })
          .run();
      });

      after(() => runResult.cleanup());

      it('should not have admin ui components', () => {
        runResult.assertNoFile(expectedFiles.clientAdminAngular);
        assert.noFile(expectedFiles.i18nAdminJson);
      });

      it('should not contains admin routing', () => {
        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/admin/admin-routing.module.ts`,
          '        {\n' +
            "          path: 'configuration',\n" +
            "          loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule)\n" +
            '        },\n' +
            '        {\n' +
            "          path: 'docs',\n" +
            "          loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule)\n" +
            '        },\n' +
            '        {\n' +
            "          path: 'health',\n" +
            "          loadChildren: () => import('./health/health.module').then(m => m.HealthModule)\n" +
            '        },\n' +
            '        {\n' +
            "          path: 'logs',\n" +
            "          loadChildren: () => import('./logs/logs.module').then(m => m.LogsModule)\n" +
            '        },\n' +
            '        {\n' +
            "          path: 'metrics',\n" +
            "          loadChildren: () => import('./metrics/metrics.module').then(m => m.MetricsModule)\n" +
            '        },'
        );
      });

      it('should not contains admin ui cypress tests', () => {
        assert.noFileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
          '  metricsPageHeadingSelector,\n' +
            '  healthPageHeadingSelector,\n' +
            '  logsPageHeadingSelector,\n' +
            '  configurationPageHeadingSelector,'
        );

        assert.noFileContent(
          `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
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

    describe('selected and React', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(require.resolve('../generators/client'))
          .withOptions({
            skipPrettier: false,
            defaultLocalConfig: { ...appDefaultConfig, clientFramework: REACT, testFrameworks: ['cypress'] },
          })
          .run();
      });

      after(() => runResult.cleanup());

      it('should have admin ui components', () => {
        runResult.assertFile(expectedFiles.clientAdminReact);
      });

      it('index.tsx should contains routes', () => {
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/index.tsx`,
          /* eslint-disable no-template-curly-in-string */
          '    <ErrorBoundaryRoute exact path={`${match.url}/health`} component={Health} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/metrics`} component={Metrics} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/configuration`} component={Configuration} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/logs`} component={Logs} />'
          /* eslint-enable no-template-curly-in-string */
        );
      });

      it('admin reducer should contains admin component related code', () => {
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/administration.reducer.ts`,
          `
  logs: {
    loggers: [] as any[],
  },
  health: {} as any,
  metrics: {} as any,
  threadDump: [],
  configuration: {
    configProps: {} as any,
    env: {} as any,
  },
`
        );

        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/administration.reducer.ts`,
          'isPending(getSystemHealth, getSystemMetrics, getSystemThreadDump, getLoggers, getConfigurations, getEnv)'
        );
      });

      it('Admin menu should contains admin entries', () => {
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/shared/layout/menus/admin.tsx`,
          `
    <MenuItem icon="tachometer-alt" to="/admin/metrics">
      <Translate contentKey="global.menu.admin.metrics">Metrics</Translate>
    </MenuItem>
    <MenuItem icon="heart" to="/admin/health">
      <Translate contentKey="global.menu.admin.health">Health</Translate>
    </MenuItem>
    <MenuItem icon="cogs" to="/admin/configuration">
      <Translate contentKey="global.menu.admin.configuration">Configuration</Translate>
    </MenuItem>
    <MenuItem icon="tasks" to="/admin/logs">
      <Translate contentKey="global.menu.admin.logs">Logs</Translate>
    </MenuItem>
`
        );
      });
    });

    describe('not selected and React', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(require.resolve('../generators/client'))
          .withOptions({
            defaultLocalConfig: {
              ...appDefaultConfig,
              clientFramework: REACT,
              testFrameworks: ['cypress'],
              withAdminUi: false,
            },
          })
          .run();
      });

      after(() => runResult.cleanup());

      it('should not have admin ui components', () => {
        runResult.assertNoFile(expectedFiles.clientAdminReact);
        assert.noFile(expectedFiles.i18nAdminJson);
      });

      it('index.tsx should contains routes', () => {
        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/index.tsx`,
          /* eslint-disable no-template-curly-in-string */
          '    <ErrorBoundaryRoute exact path={`${match.url}/health`} component={Health} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/metrics`} component={Metrics} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/docs`} component={Docs} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/configuration`} component={Configuration} />\n' +
            '    <ErrorBoundaryRoute exact path={`${match.url}/logs`} component={Logs} />'
          /* eslint-enable no-template-curly-in-string */
        );
      });

      it('admin reducer should not contains admin component related code', () => {
        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/administration.reducer.ts`,
          "  FETCH_LOGS: 'administration/FETCH_LOGS',\n" +
            "  FETCH_LOGS_CHANGE_LEVEL: 'administration/FETCH_LOGS_CHANGE_LEVEL',\n" +
            "  FETCH_HEALTH: 'administration/FETCH_HEALTH',\n" +
            "  FETCH_METRICS: 'administration/FETCH_METRICS',\n" +
            "  FETCH_THREAD_DUMP: 'administration/FETCH_THREAD_DUMP',\n" +
            "  FETCH_CONFIGURATIONS: 'administration/FETCH_CONFIGURATIONS',\n" +
            "  FETCH_ENV: 'administration/FETCH_ENV',"
        );

        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/administration.reducer.ts`,
          'logs: {\n' +
            '    loggers: [] as any[]\n' +
            '  },\n' +
            '  health: {} as any,\n' +
            '  metrics: {} as any,\n' +
            '  threadDump: [],\n' +
            '  configuration: {\n' +
            '    configProps: {} as any,\n' +
            '    env: {} as any\n' +
            '  },'
        );

        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/modules/administration/administration.reducer.ts`,
          'getSystemHealth.pending,\n' +
            '          getSystemMetrics.pending,\n' +
            '          getSystemThreadDump.pending,\n' +
            '          getLoggers.pending,\n' +
            '          getConfigurations.pending,\n' +
            '          getEnv.pending'
        );
      });

      it('Admin menu should not contains admin entries', () => {
        runResult.assertNoFileContent(
          `${CLIENT_MAIN_SRC_DIR}app/shared/layout/menus/admin.tsx`,
          '    <MenuItem icon="tachometer-alt" to="/admin/metrics"><Translate contentKey="global.menu.admin.metrics">Metrics</Translate></MenuItem>\n' +
            '    <MenuItem icon="heart" to="/admin/health"><Translate contentKey="global.menu.admin.health">Health</Translate></MenuItem>\n' +
            '    <MenuItem icon="cogs" to="/admin/configuration"><Translate contentKey="global.menu.admin.configuration">Configuration</Translate></MenuItem>\n' +
            '    <MenuItem icon="tasks" to="/admin/logs"><Translate contentKey="global.menu.admin.logs">Logs</Translate></MenuItem>'
        );
      });
    });
  });
});

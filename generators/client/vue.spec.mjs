import { expect } from 'expect';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport, clientSamples } from '../../test/support/index.mjs';
import Generator from './index.js';
import { skipPrettierHelpers as helpers } from '../../test/utils/utils.mjs';

import ClientFrameworkTypes from '../../jdl/jhipster/client-framework-types.js';
import constants from '../generator-constants.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

const { VUE: clientFramework } = ClientFrameworkTypes;
const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } = constants;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = () =>
  Object.entries(clientSamples).map(([name, sample]) => [
    name,
    {
      skipInstall: true,
      applicationWithEntities: {
        config: {
          ...sample,
          ...commonConfig,
        },
      },
    },
  ]);

const clientAdminFiles = [
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.vue`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.ts`,

  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.vue`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.vue`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.ts`,

  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.ts`,

  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.vue`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.vue`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.ts`,

  `${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics.component.spec.ts`,
  `${CLIENT_TEST_SRC_DIR}spec/app/admin/metrics/metrics-modal.component.spec.ts`,

  `${CLIENT_TEST_SRC_DIR}spec/app/admin/logs/logs.component.spec.ts`,

  `${CLIENT_TEST_SRC_DIR}spec/app/admin/configuration/configuration.component.spec.ts`,

  `${CLIENT_TEST_SRC_DIR}spec/app/admin/health/health.component.spec.ts`,
  `${CLIENT_TEST_SRC_DIR}spec/app/admin/health/health-modal.component.spec.ts`,
  `${CLIENT_TEST_SRC_DIR}spec/app/admin/health/health.service.spec.ts`,
];

describe(`JHipster ${clientFramework} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  testSamples().forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers.create(generatorFile).withOptions(sample).run();
      });

      after(() => runResult.cleanup());

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct clientFramework', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"clientFramework": "${clientFramework}"`));
      });
      it('should not contain version placeholders at package.json', () => {
        runResult.assertNoFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_COMMON/);
        runResult.assertNoFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
        runResult.assertNoFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_REACT/);
        runResult.assertNoFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_VUE/);
      });

      describe('skipJhipsterDependencies', () => {
        const { skipJhipsterDependencies } = sampleConfig;
        const skipJhipsterDependenciesTitle = skipJhipsterDependencies
          ? 'should not add generator-jhipster to package.json'
          : 'should add generator-jhipster to package.json';
        it(skipJhipsterDependenciesTitle, () => {
          const assertion = (...args) =>
            skipJhipsterDependencies ? runResult.assertNoFileContent(...args) : runResult.assertFileContent(...args);
          assertion('package.json', 'generator-jhipster');
        });
      });

      describe('withAdminUi', () => {
        const { applicationType, withAdminUi } = sampleConfig;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;
        const adminUiComponents = generateAdminUi ? 'should generate admin ui components' : 'should not generate admin ui components';

        it(adminUiComponents, () => {
          const assertion = (...args) => (generateAdminUi ? runResult.assertFile(...args) : runResult.assertNoFile(...args));
          assertion(clientAdminFiles);
        });

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin related code' : 'should not generate admin related code';
          const assertion = (...args) => (generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args));

          it(adminUiRoutingTitle, () => {
            assertion(
              `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
              "import HealthService from './admin/health/health.service';\n" +
                "import MetricsService from './admin/metrics/metrics.service';\n" +
                "import LogsService from './admin/logs/logs.service';\n" +
                "import ConfigurationService from '@/admin/configuration/configuration.service';"
            );
            assertion(
              `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
              '    healthService: () => new HealthService(),\n' +
                '    configurationService: () => new ConfigurationService(),\n' +
                '    logsService: () => new LogsService(),\n' +
                '    metricsService: () => new MetricsService(),'
            );

            assertion(
              `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
              "  const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');\n" +
                "  const JhiHealthComponent = () => import('@/admin/health/health.vue');\n" +
                "  const JhiLogsComponent = () => import('@/admin/logs/logs.vue');\n" +
                "  const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');"
            );
            assertion(
              `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
              `
    {
      path: '/admin/health',
      name: 'JhiHealthComponent',
      component: JhiHealthComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/logs',
      name: 'JhiLogsComponent',
      component: JhiLogsComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/metrics',
      name: 'JhiMetricsComponent',
      component: JhiMetricsComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/configuration',
      name: 'JhiConfigurationComponent',
      component: JhiConfigurationComponent,
      meta: { authorities: [Authority.ADMIN] }
    },`
            );
            assertion(
              `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
              '<b-dropdown-item  to="/admin/metrics" active-class="active">\n' +
                '            <font-awesome-icon icon="tachometer-alt" />\n' +
                '            <span v-text="$t(\'global.menu.admin.metrics\')">Metrics</span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
                '            <font-awesome-icon icon="heart" />\n' +
                '            <span v-text="$t(\'global.menu.admin.health\')">Health</span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item  to="/admin/configuration" active-class="active">\n' +
                '            <font-awesome-icon icon="cogs" />\n' +
                '            <span v-text="$t(\'global.menu.admin.configuration\')">Configuration</span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item  to="/admin/logs" active-class="active">\n' +
                '            <font-awesome-icon icon="tasks" />\n' +
                '            <span v-text="$t(\'global.menu.admin.logs\')">Logs</span>\n' +
                '          </b-dropdown-item>'
            );
          });
        }
      });
    });
  });
});

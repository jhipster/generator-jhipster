import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { buildClientSamples, entitiesClientSamples as entities, defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.js';

import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_VUE } from '../generator-list.js';
import Generator from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const { VUE: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildClientSamples(commonConfig);

const clientAdminFiles = clientSrcDir => [
  `${clientSrcDir}app/admin/configuration/configuration.component.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.component.spec.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.vue`,
  `${clientSrcDir}app/admin/configuration/configuration.service.ts`,

  `${clientSrcDir}app/admin/health/health.component.ts`,
  `${clientSrcDir}app/admin/health/health.component.spec.ts`,
  `${clientSrcDir}app/admin/health/health.vue`,
  `${clientSrcDir}app/admin/health/health-modal.vue`,
  `${clientSrcDir}app/admin/health/health-modal.component.ts`,
  `${clientSrcDir}app/admin/health/health-modal.component.spec.ts`,
  `${clientSrcDir}app/admin/health/health.service.ts`,
  `${clientSrcDir}app/admin/health/health.service.spec.ts`,

  `${clientSrcDir}app/admin/logs/logs.component.ts`,
  `${clientSrcDir}app/admin/logs/logs.component.spec.ts`,
  `${clientSrcDir}app/admin/logs/logs.service.ts`,

  `${clientSrcDir}app/admin/metrics/metrics.component.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.component.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics-modal.component.ts`,
  `${clientSrcDir}app/admin/metrics/metrics-modal.component.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.vue`,
  `${clientSrcDir}app/admin/metrics/metrics-modal.vue`,
  `${clientSrcDir}app/admin/metrics/metrics.service.ts`,
];

describe(`generator - ${clientFramework}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, GENERATOR_VUE);

  it('samples matrix should match snapshot', () => {
    expect(testSamples).toMatchSnapshot();
  });

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { clientRootDir = '' } = sampleConfig;

    describe(name, () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig(sampleConfig, entities)
          .withControl({ getWebappTranslation: () => 'translations' })
          .withMockedSource()
          .withSharedApplication({ gatewayServicesApiAvailable: sampleConfig.applicationType === 'gateway' })
          .withMockedGenerators(['jhipster:common', 'jhipster:languages']);
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('should match source calls snapshot', () => {
        expect(runResult.sourceCallsArg).toMatchSnapshot();
      });
      it('contains correct clientFramework', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"clientFramework": "${clientFramework}"`));
      });
      it('should not contain version placeholders at package.json', () => {
        runResult.assertNoFileContent(`${clientRootDir}package.json`, /VERSION_MANAGED_BY_CLIENT_COMMON/);
        runResult.assertNoFileContent(`${clientRootDir}package.json`, /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
        runResult.assertNoFileContent(`${clientRootDir}package.json`, /VERSION_MANAGED_BY_CLIENT_REACT/);
        runResult.assertNoFileContent(`${clientRootDir}package.json`, /VERSION_MANAGED_BY_CLIENT_VUE/);
      });

      describe('withAdminUi', () => {
        const { applicationType, withAdminUi } = sampleConfig;
        const clientSrcDir = `${clientRootDir}${CLIENT_MAIN_SRC_DIR}`;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;
        const adminUiComponents = generateAdminUi ? 'should generate admin ui components' : 'should not generate admin ui components';

        it(adminUiComponents, () => {
          const assertion = (file: string | string[]) => (generateAdminUi ? runResult.assertFile(file) : runResult.assertNoFile(file));
          assertion(clientAdminFiles(clientSrcDir));
        });

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin related code' : 'should not generate admin related code';
          const assertion = (file: string, content: string) =>
            generateAdminUi ? runResult.assertFileContent(file, content) : runResult.assertNoFileContent(file, content);

          it(adminUiRoutingTitle, () => {
            assertion(
              `${clientSrcDir}app/router/admin.ts`,
              "  const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');\n" +
                "  const JhiHealthComponent = () => import('@/admin/health/health.vue');\n" +
                "  const JhiLogsComponent = () => import('@/admin/logs/logs.vue');\n" +
                "  const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');",
            );
            assertion(
              `${clientSrcDir}app/router/admin.ts`,
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
    },`,
            );
            assertion(
              `${clientSrcDir}app/core/jhi-navbar/jhi-navbar.vue`,
              '<b-dropdown-item to="/admin/metrics" active-class="active">\n' +
                '            <font-awesome-icon icon="tachometer-alt" />\n' +
                '            <span v-text="t$(\'global.menu.admin.metrics\')"></span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
                '            <font-awesome-icon icon="heart" />\n' +
                '            <span v-text="t$(\'global.menu.admin.health\')"></span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item to="/admin/configuration" active-class="active">\n' +
                '            <font-awesome-icon icon="cogs" />\n' +
                '            <span v-text="t$(\'global.menu.admin.configuration\')"></span>\n' +
                '          </b-dropdown-item>\n' +
                '          <b-dropdown-item to="/admin/logs" active-class="active">\n' +
                '            <font-awesome-icon icon="tasks" />\n' +
                '            <span v-text="t$(\'global.menu.admin.logs\')"></span>\n' +
                '          </b-dropdown-item>',
            );
          });
        }
      });
    });
  });
});

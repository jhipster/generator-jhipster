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

const { ANGULAR: clientFramework } = ClientFrameworkTypes;
const { CLIENT_MAIN_SRC_DIR } = constants;
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
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.route.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.module.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.model.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/modal/health-modal.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/modal/health-modal.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.route.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.module.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.model.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/log.model.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.route.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.module.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/jvm-memory/jvm-memory.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/jvm-memory/jvm-memory.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/jvm-threads/jvm-threads.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/jvm-threads/jvm-threads.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-cache/metrics-cache.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-cache/metrics-cache.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-request/metrics-request.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-request/metrics-request.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-system/metrics-system.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/blocks/metrics-system/metrics-system.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.html`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.route.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.module.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.model.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/modal/health-modal.component.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.spec.ts`,
  `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.spec.ts`,
];

describe(`JHipster ${clientFramework} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should be exported at package.json', async () => {
    await expect((await import(`generator-jhipster/esm/generators/${generator}`)).default).toBe(Generator);
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
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          it(adminUiRoutingTitle, () => {
            const assertion = (...args) =>
              generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args);
            assertion(
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
        }
      });
    });
  });
});

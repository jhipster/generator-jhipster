import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

import { snakeCase } from 'lodash-es';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { buildClientSamples, defaultHelpers as helpers, entitiesClientSamples as entities, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_ANGULAR } from '../generator-list.ts';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const { ANGULAR: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildClientSamples(commonConfig);

const clientAdminFiles = (clientSrcDir: string) => [
  `${clientSrcDir}app/admin/configuration/configuration.component.html`,
  `${clientSrcDir}app/admin/configuration/configuration.component.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.service.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.model.ts`,
  `${clientSrcDir}app/admin/health/modal/health-modal.component.html`,
  `${clientSrcDir}app/admin/health/modal/health-modal.component.ts`,
  `${clientSrcDir}app/admin/health/health.component.html`,
  `${clientSrcDir}app/admin/health/health.component.ts`,
  `${clientSrcDir}app/admin/health/health.service.ts`,
  `${clientSrcDir}app/admin/health/health.model.ts`,
  `${clientSrcDir}app/admin/logs/log.model.ts`,
  `${clientSrcDir}app/admin/logs/logs.component.html`,
  `${clientSrcDir}app/admin/logs/logs.component.ts`,
  `${clientSrcDir}app/admin/logs/logs.service.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-memory/jvm-memory.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-memory/jvm-memory.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-threads/jvm-threads.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-threads/jvm-threads.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-cache/metrics-cache.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-cache/metrics-cache.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-request/metrics-request.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-request/metrics-request.component.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-system/metrics-system.component.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-system/metrics-system.component.html`,
  `${clientSrcDir}app/admin/metrics/metrics.component.html`,
  `${clientSrcDir}app/admin/metrics/metrics.component.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.service.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.model.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.component.spec.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.service.spec.ts`,
  `${clientSrcDir}app/admin/health/modal/health-modal.component.spec.ts`,
  `${clientSrcDir}app/admin/health/health.component.spec.ts`,
  `${clientSrcDir}app/admin/health/health.service.spec.ts`,
  `${clientSrcDir}app/admin/logs/logs.component.spec.ts`,
  `${clientSrcDir}app/admin/logs/logs.service.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.component.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.service.spec.ts`,
];

describe(`generator - ${clientFramework}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  checkEnforcements({ client: true }, GENERATOR_ANGULAR);

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
          .withSharedApplication({ gatewayServicesApiAvailable: sampleConfig.applicationType === 'gateway' })
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withMockedSource()
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
        const { applicationType, withAdminUi, clientRootDir = '' } = sampleConfig;
        const clientSrcDir = `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;
        const adminUiComponents = generateAdminUi ? 'should generate admin ui components' : 'should not generate admin ui components';

        it(adminUiComponents, () => {
          const assertion = (file: string | string[]) => (generateAdminUi ? runResult.assertFile(file) : runResult.assertNoFile(file));
          assertion(clientAdminFiles(clientSrcDir));
        });

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          it(adminUiRoutingTitle, () => {
            const assertion = (file: string, content: string) =>
              generateAdminUi ? runResult.assertFileContent(file, content) : runResult.assertNoFileContent(file, content);
            assertion(
              `${clientSrcDir}app/admin/admin.routes.ts`,
              `
  {
    path: 'configuration',
    loadComponent: () => import('./configuration/configuration.component'),
    title: 'configuration.title',
  },
  {
    path: 'health',
    loadComponent: () => import('./health/health.component'),
    title: 'health.title',
  },
  {
    path: 'logs',
    loadComponent: () => import('./logs/logs.component'),
    title: 'logs.title',
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics/metrics.component'),
    title: 'metrics.title',
  },
`,
            );
          });
        }
      });
    });
  });
});

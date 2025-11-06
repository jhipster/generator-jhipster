import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { buildClientSamples, defaultHelpers as helpers, entitiesClientSamples as entities, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';

import Generator from './index.ts';

const generator = basename(import.meta.dirname);

const { ANGULAR: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr' as const, 'en' as const] };

const testSamples = buildClientSamples(commonConfig);

const clientAdminFiles = (clientSrcDir: string) => [
  `${clientSrcDir}app/admin/configuration/configuration.html`,
  `${clientSrcDir}app/admin/configuration/configuration.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.service.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.model.ts`,
  `${clientSrcDir}app/admin/health/modal/health-modal.html`,
  `${clientSrcDir}app/admin/health/modal/health-modal.ts`,
  `${clientSrcDir}app/admin/health/health.html`,
  `${clientSrcDir}app/admin/health/health.ts`,
  `${clientSrcDir}app/admin/health/health.service.ts`,
  `${clientSrcDir}app/admin/health/health.model.ts`,
  `${clientSrcDir}app/admin/logs/log.model.ts`,
  `${clientSrcDir}app/admin/logs/logs.html`,
  `${clientSrcDir}app/admin/logs/logs.ts`,
  `${clientSrcDir}app/admin/logs/logs.service.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-memory/jvm-memory.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-memory/jvm-memory.html`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-threads/jvm-threads.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/jvm-threads/jvm-threads.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-cache/metrics-cache.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-cache/metrics-cache.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-datasource/metrics-datasource.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-request/metrics-request.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-request/metrics-request.html`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-system/metrics-system.ts`,
  `${clientSrcDir}app/admin/metrics/blocks/metrics-system/metrics-system.html`,
  `${clientSrcDir}app/admin/metrics/metrics.html`,
  `${clientSrcDir}app/admin/metrics/metrics.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.service.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.model.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.spec.ts`,
  `${clientSrcDir}app/admin/configuration/configuration.service.spec.ts`,
  `${clientSrcDir}app/admin/health/modal/health-modal.spec.ts`,
  `${clientSrcDir}app/admin/health/health.spec.ts`,
  `${clientSrcDir}app/admin/health/health.service.spec.ts`,
  `${clientSrcDir}app/admin/logs/logs.spec.ts`,
  `${clientSrcDir}app/admin/logs/logs.service.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.spec.ts`,
  `${clientSrcDir}app/admin/metrics/metrics.service.spec.ts`,
];

describe(`generator - ${clientFramework}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  checkEnforcements({ client: true }, generator);

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
          .withMockedGenerators(['jhipster:common', 'jhipster:client:i18n']);
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
    loadComponent: () => import('./configuration/configuration'),
    title: 'configuration.title',
  },
  {
    path: 'health',
    loadComponent: () => import('./health/health'),
    title: 'health.title',
  },
  {
    path: 'logs',
    loadComponent: () => import('./logs/logs'),
    title: 'logs.title',
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics/metrics'),
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

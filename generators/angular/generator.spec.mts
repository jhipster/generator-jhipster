import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildClientSamples, entitiesClientSamples as entities } from '../../test/support/index.mjs';
import { testBlueprintSupport } from '../../test/support/tests.mjs';
import Generator from './index.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';

import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.mjs';
import BaseApplicationGenerator from '../base-application/index.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mts');

const { ANGULAR: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const samplesBuilder = () =>
  Object.entries(buildClientSamples()).map(([name, sample]) => [
    name,
    {
      skipInstall: true,
      applicationWithEntities: {
        config: {
          ...sample,
          ...commonConfig,
        },
        entities,
      },
    },
  ]);

const clientAdminFiles = clientSrcDir => [
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

const testSamples = samplesBuilder();

class MockedLanguagesGenerator extends BaseApplicationGenerator<any> {
  get [BaseApplicationGenerator.PREPARING]() {
    return {
      mockTranslations({ control }) {
        control.getWebappTranslation = () => 'translations';
      },
    };
  }
}

describe(`generator - ${clientFramework}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  it('samples matrix should match snapshot', () => {
    expect(Object.fromEntries(testSamples)).toMatchSnapshot();
  });

  testSamples.forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers
          .run(generatorFile)
          .withOptions(sample)
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .withMockedGenerators(['jhipster:common']);
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
        const { applicationType, withAdminUi, clientSrcDir = CLIENT_MAIN_SRC_DIR } = sampleConfig;
        const generateAdminUi = applicationType !== 'microservice' && withAdminUi;
        const adminUiComponents = generateAdminUi ? 'should generate admin ui components' : 'should not generate admin ui components';

        it(adminUiComponents, () => {
          const assertion = (...args) => (generateAdminUi ? runResult.assertFile(...args) : runResult.assertNoFile(...args));
          assertion(clientAdminFiles(clientSrcDir));
        });

        if (applicationType !== 'microservice') {
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin routing' : 'should not generate admin routing';
          it(adminUiRoutingTitle, () => {
            const assertion = (...args) =>
              generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args);
            assertion(
              `${clientSrcDir}app/admin/admin-routing.module.ts`,
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
`
            );
          });
        }
      });
    });
  });
});

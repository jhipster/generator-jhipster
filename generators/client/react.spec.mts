import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport, buildClientSamples, entitiesClientSamples as entities } from '../../test/support/index.mjs';
import Generator from './index.mjs';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';

import ClientFrameworkTypes from '../../jdl/jhipster/client-framework-types.js';
import constants from '../generator-constants.cjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mjs');

const { REACT: clientFramework } = ClientFrameworkTypes;
const { CLIENT_MAIN_SRC_DIR } = constants;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const samplesBuilder = () =>
  Object.entries(buildClientSamples()).map(([name, sample]) => [
    name,
    {
      skipInstall: true,
      applicationWithEntities: {
        config: {
          ...commonConfig,
          ...sample,
        },
        entities,
      },
    },
  ]);

const clientAdminFiles = clientSrcDir => [
  `${clientSrcDir}app/modules/administration/configuration/configuration.tsx`,
  `${clientSrcDir}app/modules/administration/health/health.tsx`,
  `${clientSrcDir}app/modules/administration/health/health-modal.tsx`,
  `${clientSrcDir}app/modules/administration/metrics/metrics.tsx`,
  `${clientSrcDir}app/modules/administration/logs/logs.tsx`,
];

const testSamples = samplesBuilder();

describe(`JHipster ${clientFramework} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.cjs')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
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
        runResult = await helpers.run(generatorFile).withOptions(sample).withMockedGenerators(['jhipster:common', 'jhipster:languages']);
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
          const adminUiRoutingTitle = generateAdminUi ? 'should generate admin related code' : 'should not generate admin related code';
          const assertion = (...args) => (generateAdminUi ? runResult.assertFileContent(...args) : runResult.assertNoFileContent(...args));

          it(adminUiRoutingTitle, () => {
            assertion(
              `${clientSrcDir}app/modules/administration/administration.reducer.ts`,
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

            assertion(
              `${clientSrcDir}app/shared/layout/menus/admin.tsx`,
              '    <MenuItem icon="tachometer-alt" to="/admin/metrics"><Translate contentKey="global.menu.admin.metrics">Metrics</Translate></MenuItem>\n' +
                '    <MenuItem icon="heart" to="/admin/health"><Translate contentKey="global.menu.admin.health">Health</Translate></MenuItem>\n' +
                '    <MenuItem icon="cogs" to="/admin/configuration"><Translate contentKey="global.menu.admin.configuration">Configuration</Translate></MenuItem>\n' +
                '    <MenuItem icon="tasks" to="/admin/logs"><Translate contentKey="global.menu.admin.logs">Logs</Translate></MenuItem>'
            );
          });
        }
      });
    });
  });
});

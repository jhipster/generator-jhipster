import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, after, expect } from 'esmocha';
import lodash from 'lodash';

import { buildClientSamples, entitiesClientSamples as entities, defaultHelpers as helpers } from '../../testing/index.js';
import { shouldSupportFeatures, testBlueprintSupport, checkEnforcements } from '../../test/support/index.js';
import Generator from './index.js';

import { clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_REACT } from '../generator-list.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.ts');

const { REACT: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildClientSamples(commonConfig);

const clientAdminFiles = clientSrcDir => [
  `${clientSrcDir}app/modules/administration/configuration/configuration.tsx`,
  `${clientSrcDir}app/modules/administration/health/health.tsx`,
  `${clientSrcDir}app/modules/administration/health/health-modal.tsx`,
  `${clientSrcDir}app/modules/administration/metrics/metrics.tsx`,
  `${clientSrcDir}app/modules/administration/logs/logs.tsx`,
];

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
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, GENERATOR_REACT);

  it('samples matrix should match snapshot', () => {
    expect(testSamples).toMatchSnapshot();
  });

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { clientRootDir = '' } = sampleConfig;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers
          .run(generatorFile)
          .withJHipsterConfig(sampleConfig, entities)
          .withGenerators([[MockedLanguagesGenerator, { namespace: 'jhipster:languages' }]])
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
                '  },',
            );

            assertion(
              `${clientSrcDir}app/shared/layout/menus/admin.tsx`,
              '    <MenuItem icon="tachometer-alt" to="/admin/metrics"><Translate contentKey="global.menu.admin.metrics">Metrics</Translate></MenuItem>\n' +
                '    <MenuItem icon="heart" to="/admin/health"><Translate contentKey="global.menu.admin.health">Health</Translate></MenuItem>\n' +
                '    <MenuItem icon="cogs" to="/admin/configuration"><Translate contentKey="global.menu.admin.configuration">Configuration</Translate></MenuItem>\n' +
                '    <MenuItem icon="tasks" to="/admin/logs"><Translate contentKey="global.menu.admin.logs">Logs</Translate></MenuItem>',
            );
          });
        }
      });
    });
  });
});

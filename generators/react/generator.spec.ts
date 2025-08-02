import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { buildClientSamples, defaultHelpers as helpers, entitiesClientSamples as entities, runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_REACT } from '../generator-list.ts';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

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

describe(`generator - ${clientFramework}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
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
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig(sampleConfig, entities)
          .withSharedApplication({
            gatewayServicesApiAvailable: sampleConfig.applicationType === 'gateway',
            getWebappTranslation: () => 'translations',
          })
          .withMockedGenerators(['jhipster:languages'])
          .withMockedSource()
          .withMockedGenerators(['jhipster:common']);
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
        const clientSrcDir = `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`;
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
              `${clientSrcDir}app/modules/administration/administration.reducer.ts`,
              'logs: {\n' +
                '    loggers: [] as any[],\n' +
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

  describe('addClientStyle needle api', () => {
    before(async () => {
      await helpers
        .runJHipster('react')
        .withJHipsterConfig({
          clientFramework: 'react',
          skipServer: true,
        })
        .withTask(
          'postWriting',
          asPostWritingTask(({ source }) => {
            source.addClientStyle!({ style: '@import without-comment' });
            source.addClientStyle!({ style: '@import with-comment', comment: 'my comment' });
          }),
        );
    });

    it('Assert app.scss is updated', () => {
      runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import without-comment');
      runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/app.scss`, '@import with-comment');
      runResult.assertFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/app.scss`,
        '* ==========================================================================\n' +
          'my comment\n' +
          '========================================================================== */\n',
      );
    });
  });

  describe('addEntitiesToClient needle api', () => {
    before(async () => {
      await helpers
        .runJHipster('react')
        .withJHipsterConfig({
          clientFramework: 'react',
          enableTranslation: false,
        })
        .withTask(
          'postWriting',
          asPostWritingTask<ClientEntity, ClientApplication<ClientEntity>>(({ application, source }) => {
            source.addEntitiesToClient({
              application,
              entities: [
                {
                  entityAngularName: 'entityName',
                  entityPage: 'entityPage',
                  entityUrl: 'entityUrl',
                  entityInstance: 'entityInstance',
                  entityFolderName: 'entityFolderName',
                  entityFileName: 'entityFileName',
                  entityClassHumanized: 'Router Name',
                } as ClientEntity,
              ],
            });
          }),
        );
    });

    it('Assert entity is added to module', () => {
      const indexModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/routes.tsx`;
      const indexReducerPath = `${CLIENT_MAIN_SRC_DIR}app/entities/reducers.ts`;

      runResult.assertFileContent(indexModulePath, "import entityName from './entityFolderName';");
      runResult.assertFileContent(indexModulePath, '<Route path="/entityUrl/*" element={<entityName />} />');

      runResult.assertFileContent(indexReducerPath, "import entityInstance from 'app/entities/entityFolderName/entityFileName.reducer';");
      runResult.assertFileContent(indexReducerPath, 'entityInstance,');
    });

    it('Assert entity is added to menu', () => {
      runResult.assertFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/entities/menu.tsx`,
        /<MenuItem icon="asterisk" to="\/entityPage">\n( *)Router Name\n( *)<\/MenuItem>/,
      );
    });
  });
});

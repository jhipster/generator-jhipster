/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

import Generator from './index.ts';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import {
  buildClientSamples,
  createTestHelpers,
  entitiesClientSamples as entities,
  entitiesWithEmbeddedRelationship,
  runResult,
} from '#testing';

const helpers = createTestHelpers({
  importMeta: import.meta,
});

const generator = basename(import.meta.dirname);

const { VUE: clientFramework } = clientFrameworkTypes;
const commonConfig = { clientFramework, nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildClientSamples(commonConfig);

const clientAdminFiles = (clientSrcDir: string) => [
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
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, generator);

  describe('migration', () => {
    describe('clientBundler option', () => {
      describe('webpack application', () => {
        before(async () => {
          await helpers
            .runJHipster()
            .withJHipsterConfig({ jhipsterVersion: '9.3.0', microfrontend: true, clientBundler: 'webpack', devServerPort: 9060 })
            .commitFiles()
            .withSharedApplication({ getWebappTranslation: () => 'translations' })
            .withSkipWritingPriorities()
            .withMockedJHipsterGenerators();
        });

        it('should remove clientBundler and devServerPort', () => {
          runResult.assertJHipsterConfigContent({
            clientBundler: undefined,
            devServerPort: undefined,
          });
        });
      });

      describe('rsbuild application', () => {
        before(async () => {
          await helpers
            .runJHipster()
            .withJHipsterConfig({ jhipsterVersion: '9.3.0', microfrontend: true, clientBundler: 'rsbuild', devServerPort: 3001 })
            .commitFiles()
            .withSharedApplication({ getWebappTranslation: () => 'translations' })
            .withSkipWritingPriorities()
            .withMockedJHipsterGenerators();
        });

        it('should keep clientBundler and devServerPort', () => {
          runResult.assertJHipsterConfigContent({
            clientBundler: 'rsbuild',
            devServerPort: 3001,
          });
        });
      });
    });
  });

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
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withMockedSource()
          .withSharedApplication({ gatewayServicesApiAvailable: sampleConfig.applicationType === 'gateway' })
          .withMockedGenerators(['jhipster:common', 'jhipster:client:i18n']);
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      it('should match application snapshot', () => {
        const { application } = runResult;
        expect(application).toMatchSnapshot({
          addLanguageCallbacks: expect.any(Array),
          customizeTemplatePaths: expect.any(Array),
          dockerContainers: expect.any(Object),
          entities: expect.any(Array),
          languages: expect.any(Array),
          javaNodeBuildPaths: expect.any(Array),
          jhipsterPackageJson: expect.any(Object),
          nodeDependencies: expect.any(Object),
          prettierExtensions: expect.any(Array),
          prettierFolders: expect.any(Array),
          supportedLanguages: expect.any(Array),
          ...(application?.generateBuiltInUserEntity ?
            {
              user: expect.any(Object),
            }
          : {}),
          ...(application?.generateBuiltInAuthorityEntity ?
            {
              authority: expect.any(Object),
            }
          : {}),
          ...(application?.generateUserManagement ?
            {
              userManagement: expect.any(Object),
            }
          : {}),
          ...(application?.enableTranslation ?
            {
              languagesToGenerateDefinition: expect.any(Array),
            }
          : {}),
        });
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
        const { applicationType, withAdminUi, enableTranslation } = sampleConfig;
        const clientSrcDir = `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`;
        const generateAdminUi = withAdminUi;
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
            if (enableTranslation) {
              assertion(
                `${clientSrcDir}app/core/jhi-navbar/jhi-navbar.vue`,
                '<b-dropdown-item to="/admin/metrics" active-class="active">\n' +
                  '            <font-awesome-icon icon="tachometer-alt" />\n' +
                  "            <span>{{ t$('global.menu.admin.metrics') }}</span>\n" +
                  '          </b-dropdown-item>\n' +
                  '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
                  '            <font-awesome-icon icon="heart" />\n' +
                  "            <span>{{ t$('global.menu.admin.health') }}</span>\n" +
                  '          </b-dropdown-item>\n' +
                  '          <b-dropdown-item to="/admin/configuration" active-class="active">\n' +
                  '            <font-awesome-icon icon="cogs" />\n' +
                  "            <span>{{ t$('global.menu.admin.configuration') }}</span>\n" +
                  '          </b-dropdown-item>\n' +
                  '          <b-dropdown-item to="/admin/logs" active-class="active">\n' +
                  '            <font-awesome-icon icon="tasks" />\n' +
                  "            <span>{{ t$('global.menu.admin.logs') }}</span>\n" +
                  '          </b-dropdown-item>',
              );
            }
          });
        }
      });
    });
  });

  describe('entity with a relationship to an embedded entity', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ clientFramework, databaseType: 'mongodb' }, entitiesWithEmbeddedRelationship)
        .withSharedApplication({ getWebappTranslation: () => 'translations' })
        .withMockedSource()
        .withMockedGenerators(['jhipster:common', 'jhipster:client:i18n']);
    });

    it('should generate the embedded entity model', () => {
      runResult.assertFile(`${CLIENT_MAIN_SRC_DIR}app/shared/model/embedded-entity.model.ts`);
    });

    it('should not generate ui files for the embedded entity', () => {
      runResult.assertNoFile([
        `${CLIENT_MAIN_SRC_DIR}app/entities/embedded-entity/embedded-entity.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/embedded-entity/embedded-entity.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/embedded-entity/embedded-entity-update.vue`,
      ]);
    });

    it('should not use the embedded entity service at the update component', () => {
      runResult.assertNoFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/entities/relationship-with-embedded/relationship-with-embedded-update.component.ts`,
        'embedded-entity.service',
      );
      runResult.assertNoFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/entities/relationship-with-embedded/relationship-with-embedded-update.component.spec.ts`,
        'embeddedEntityService',
      );
    });

    it('should not render the embedded relationship at list and detail components', () => {
      runResult.assertNoFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/entities/relationship-with-embedded/relationship-with-embedded.vue`,
        'embeddedRelationship',
      );
      runResult.assertNoFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/entities/relationship-with-embedded/relationship-with-embedded-details.vue`,
        'embeddedRelationship',
      );
    });
  });
});

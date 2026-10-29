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

import { mutateData, stringHashCode } from '../../lib/utils/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { createFaker } from '../base-application/support/index.ts';
import { generateTestEntity } from '../client/support/index.ts';
import type { Source as JavaSource } from '../java/types.d.ts';

import { playwrightEntityFiles, playwrightFiles } from './files.ts';
import type {
  Application as PlaywrightApplication,
  Config as PlaywrightConfig,
  Entity as PlaywrightEntity,
  Features as PlaywrightFeatures,
  Field as PlaywrightField,
  Options as PlaywrightOptions,
} from './types.ts';

export default class PlaywrightGenerator extends BaseApplicationGenerator<PlaywrightEntity, PlaywrightApplication, PlaywrightConfig> {
  angularSchematic = false;

  constructor(args?: string[], options?: PlaywrightOptions, features?: PlaywrightFeatures) {
    super(args, options, { ...features, loadCommand: ['jhipster:server'] });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('e2e');
      await this.dependsOnJHipster('javascript-simple-application');
      await this.dependsOnJHipster('jhipster:e2e:common');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('playwright', 'resources', 'package.json'),
        );
      },
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          playwrightDir: ({ clientTestDir }) => (clientTestDir ? `${clientTestDir}playwright/` : 'playwright/'),
          playwrightTemporaryDir: ({ temporaryDir }) => (temporaryDir ? `${temporaryDir}playwright/` : '.playwright/'),
          playwrightBootstrapEntities: true,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      // The e2e properties of the application are final once it is prepared.
      npmScripts({ application }) {
        this.angularSchematic = Boolean(application.clientFrameworkAngular);
        const {
          clientRootDir,
          clientNpmRun,
          clientNgCommand: ng,
          e2eNgBuilder,
          e2eDevServerHost,
          e2eDevServerPort,
          e2eWaitTimeout,
        } = application;
        const clientStart = clientRootDir ? `"${clientNpmRun} start"` : 'npm:start';

        Object.assign(application.clientPackageJsonScripts, {
          // Cypress downloads its binary from its own npm postinstall; playwright needs the browsers to be
          // fetched explicitly. The download is cached, so running it before every e2e run is cheap.
          'playwright:install': 'playwright install chromium',
          'pree2e:playwright': 'npm run playwright:install',
          playwright: 'playwright test --ui',
          e2e: 'npm run e2e:playwright:headed --',
          'e2e:playwright': 'playwright test --project=chromium',
          'e2e:playwright:headed': 'npm run e2e:playwright -- --headed',
          'e2e:headless': 'npm run e2e:playwright --',
        });

        // With e2eTls the packaged server is started with its tls and tls-samples profiles: wait for it and test it over https, at the port
        // of the package.json config, like the other scripts.
        const e2eTlsEnv =
          application.e2eTls ? 'E2E_SERVER_PROTOCOL=https E2E_BASE_URL=https://localhost:$npm_package_config_backend_port/ ' : '';

        // Scripts that handle server and client concurrently should be added to the root package.json
        Object.assign(application.packageJsonScripts, {
          'ci:e2e:run': `${e2eTlsEnv}concurrently -k -s first -n application,e2e -c red,blue npm:ci:e2e:server:start npm:e2e:headless`,
          'e2e:devserver':
            e2eNgBuilder ?
              `concurrently -k -s first -n backend,e2e -c red,blue npm:backend:start "${clientNpmRun} playwright:install && npm run ci:server:await --if-present && ${ng} e2e --configuration run"`
            : `concurrently -k -s first -n backend,frontend,e2e -c red,yellow,blue npm:backend:start ${clientStart} "wait-on -t ${e2eWaitTimeout} http-get://${e2eDevServerHost}:${e2eDevServerPort} && E2E_BASE_URL=http://localhost:${e2eDevServerPort} npm run e2e:headless"`,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareForTemplates({ entity }) {
        mutateData(entity, {
          generateEntityPlaywright: ({ builtInUserManagement, skipClient }) => !skipClient || builtInUserManagement,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        const faker = await createFaker();
        faker.seed(stringHashCode(application.baseName));
        const context = { ...application, faker };
        return this.writeFiles({
          sections: playwrightFiles,
          context,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writePlaywrightEntityFiles({ application, entities }) {
        for (const entity of entities.filter(
          entity => entity.generateEntityPlaywright && !entity.embedded && !entity.builtInUser && !entity.entityClientModelOnly,
        )) {
          const context = { ...application, ...entity };
          await this.writeFiles({
            sections: playwrightEntityFiles,
            context,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJson({ application }) {
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            '@playwright/test': application.nodeDependencies['@playwright/test'],
            'eslint-plugin-playwright': application.nodeDependencies['eslint-plugin-playwright'],
            ...(this.angularSchematic ? { 'playwright-ng-schematics': application.nodeDependencies['playwright-ng-schematics'] } : {}),
          },
        });
        this.packageJson.merge({
          allowScripts: {
            '@playwright/test': true,
          },
        });
        if (application.nodePackageManagerPnpm && !application.monorepository) {
          this.mergeDestinationYaml('pnpm-workspace.yaml', { allowBuilds: { '@playwright/test': true } });
        }
      },
      playwrightSchematics({ application }) {
        const { dasherizedBaseName, clientRootDir } = application;
        if (!this.angularSchematic) return;

        // The builder only accepts the options declared in its schema: it has no baseUrl. It starts the dev server
        // named by devServerTarget and hands its url to playwright.config.ts through PLAYWRIGHT_TEST_BASE_URL.
        this.mergeDestinationJson(`${clientRootDir}angular.json`, {
          projects: {
            [dasherizedBaseName]: {
              architect: {
                e2e: {
                  builder: 'playwright-ng-schematics:playwright',
                  options: { devServerTarget: `${dasherizedBaseName}:serve` },
                  configurations: {
                    open: { ui: true, devServerTarget: `${dasherizedBaseName}:serve` },
                    openProduction: { ui: true, devServerTarget: `${dasherizedBaseName}:serve:production` },
                    run: { devServerTarget: `${dasherizedBaseName}:serve` },
                    runProduction: { devServerTarget: `${dasherizedBaseName}:serve:production` },
                  },
                  defaultConfiguration: 'open',
                },
              },
            },
          },
        });
      },
      mavenProfile({ source }) {
        (source as JavaSource).addMavenProfile?.({
          id: 'e2e',
          content: `
            <properties>
                <profile.e2e>,e2e</profile.e2e>
            </properties>
            <build>
                <finalName>e2e</finalName>
            </build>
          `,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  generateTestEntity(fields: PlaywrightField[]) {
    return generateTestEntity(fields);
  }
}

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
import { testFrameworkTypes } from '../../lib/jhipster/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import type { Source as JavaSource } from '../java/types.d.ts';

import { playwrightFiles } from './files.ts';
import type {
  Application as PlaywrightApplication,
  Config as PlaywrightConfig,
  Entity as PlaywrightEntity,
  Features as PlaywrightFeatures,
  Options as PlaywrightOptions,
} from './types.ts';

const WAIT_TIMEOUT = 3 * 60000;
const { CYPRESS } = testFrameworkTypes;

export default class PlaywrightGenerator extends BaseApplicationGenerator<PlaywrightEntity, PlaywrightApplication, PlaywrightConfig> {
  constructor(args?: string[], options?: PlaywrightOptions, features?: PlaywrightFeatures) {
    super(args, options, { ...features, loadCommand: ['jhipster:server'] });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('client');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('client', 'resources', 'package.json'),
        );
      },
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          playwrightDir: ({ clientTestDir }) => (clientTestDir ? `${clientTestDir}playwright/` : 'playwright/'),
          playwrightTemporaryDir: ({ temporaryDir }) => (temporaryDir ? `${temporaryDir}playwright/` : '.playwright/'),
        });
      },
      npmScripts({ application }) {
        const { clientRootDir, devServerPort, devServerPortProxy: devServerPortE2e = devServerPort, testFrameworks = [] } = application;
        const primaryE2eFramework = !testFrameworks.includes(CYPRESS);

        Object.assign(application.clientPackageJsonScripts, {
          playwright: 'playwright test --ui',
          'e2e:playwright': 'playwright test',
          'e2e:playwright:devserver': 'playwright test',
          'e2e:playwright:headed': 'playwright test --headed',
        });

        if (primaryE2eFramework) {
          Object.assign(application.clientPackageJsonScripts, {
            e2e: 'npm run e2e:playwright:headed --',
            'e2e:headless': 'npm run e2e:playwright --',
          });

          Object.assign(application.packageJsonScripts, {
            'ci:e2e:run': 'concurrently -k -s first -n application,e2e -c red,blue npm:ci:e2e:server:start npm:e2e:headless',
            'ci:e2e:dev': 'concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e:headless',
            'e2e:dev': 'concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e',
            'e2e:devserver': `concurrently -k -s first -n backend,frontend,e2e -c red,yellow,blue npm:backend:start npm:start "wait-on -t ${WAIT_TIMEOUT} http-get://127.0.0.1:${devServerPortE2e} && npm run e2e:playwright:devserver"`,
          });

          if (clientRootDir) {
            Object.assign(application.packageJsonScripts, {
              'e2e:headless': `npm run -w ${clientRootDir} e2e:headless`,
              'e2e:playwright:devserver': `npm run -w ${clientRootDir} e2e:playwright:devserver`,
            });
          } else if (application.backendTypeJavaAny) {
            Object.assign(application.clientPackageJsonScripts, {
              'pree2e:headless': 'npm run ci:server:await',
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        return this.writeFiles({
          sections: playwrightFiles,
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJson({ application }) {
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            '@playwright/test': application.nodeDependencies['@playwright/test'],
            'eslint-plugin-playwright': application.nodeDependencies['eslint-plugin-playwright'],
          },
          scripts: {
            playwright: application.clientPackageJsonScripts.playwright,
            'e2e:playwright': application.clientPackageJsonScripts['e2e:playwright'],
            'e2e:playwright:devserver': application.clientPackageJsonScripts['e2e:playwright:devserver'],
            'e2e:playwright:headed': application.clientPackageJsonScripts['e2e:playwright:headed'],
            ...(application.clientPackageJsonScripts.e2e ? { e2e: application.clientPackageJsonScripts.e2e } : {}),
            ...(application.clientPackageJsonScripts['e2e:headless'] ?
              { 'e2e:headless': application.clientPackageJsonScripts['e2e:headless'] }
            : {}),
            ...(application.clientPackageJsonScripts['pree2e:headless'] ?
              { 'pree2e:headless': application.clientPackageJsonScripts['pree2e:headless'] }
            : {}),
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
}

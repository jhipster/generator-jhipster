/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { mutateData, stringHashCode } from '../../lib/utils/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { createFaker } from '../base-application/support/index.ts';
import { generateTestEntity } from '../client/support/index.ts';
import type { Source as ClientSource } from '../client/types.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import type { Source as JavaSource } from '../java/types.d.ts';

import { cypressEntityFiles, cypressFiles } from './files.ts';
import type { Application as CypressApplication, Entity as CypressEntity, Field as CypressField } from './types.js';

const { ANGULAR } = clientFrameworkTypes;

const WAIT_TIMEOUT = 3 * 60000;

export default class CypressGenerator extends BaseApplicationGenerator<CypressEntity, CypressApplication<CypressEntity>> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
      await this.dependsOnBootstrapApplication();
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForCypressOptions({ control }) {
        if (control.existingProject && !this.options.askAnswered) return;
        await this.prompt(
          [
            {
              when: (this.jhipsterConfig as any).clientFramework === ANGULAR,
              type: 'confirm',
              name: 'cypressCoverage',
              message: 'Would you like to generate code coverage for Cypress tests? [Experimental]',
            },
            {
              type: 'confirm',
              name: 'cypressAudit',
              message: 'Would you like to audit Cypress tests?',
            },
          ],
          this.config,
        );
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('client', 'resources', 'package.json'),
        );
      },

      prepareForTemplates({ application }) {
        const { cypressAudit = true, cypressCoverage = false } = this.jhipsterConfig as any;
        application.cypressAudit = cypressAudit;
        application.cypressCoverage = cypressCoverage;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          cypressDir: ({ clientTestDir }) => (clientTestDir ? `${clientTestDir}cypress/` : 'cypress/'),
          cypressTemporaryDir: ({ temporaryDir }) => (temporaryDir ? `${temporaryDir}cypress/` : '.cypress/'),
          cypressBootstrapEntities: true,
        });
      },
      npmScripts({ application }) {
        const { devServerPort, devServerPortProxy: devServerPortE2e = devServerPort } = application;

        Object.assign(application.clientPackageJsonScripts, {
          cypress: 'cypress open --e2e',
          e2e: 'npm run e2e:cypress:headed --',
          'e2e:cypress': 'cypress run --e2e --browser chrome',
          'e2e:cypress:headed': 'npm run e2e:cypress -- --headed',
          'e2e:cypress:record': 'npm run e2e:cypress -- --record',
          'e2e:headless': 'npm run e2e:cypress --',
        });

        // Scripts that handle server and client concurrently should be added to the root package.json
        Object.assign(application.packageJsonScripts, {
          'ci:e2e:run': 'concurrently -k -s first -n application,e2e -c red,blue npm:ci:e2e:server:start npm:e2e:headless',
          'ci:e2e:dev': `concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e:headless`,
          'e2e:dev': `concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e`,
          'e2e:devserver': `concurrently -k -s first -n backend,frontend,e2e -c red,yellow,blue npm:backend:start npm:start "wait-on -t ${WAIT_TIMEOUT} http-get://127.0.0.1:${devServerPortE2e} && npm run e2e:headless -- -c baseUrl=http://localhost:${devServerPortE2e}"`,
        });

        if (application.clientRootDir) {
          // Add scripts to map to client package.json
          Object.assign(application.packageJsonScripts, {
            'e2e:headless': `npm run -w ${application.clientRootDir} e2e:headless`,
          });
        } else if (application.backendTypeJavaAny) {
          Object.assign(application.clientPackageJsonScripts, {
            'pree2e:headless': 'npm run ci:server:await',
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postPreparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareForTemplates({ entity }) {
        mutateData(entity, {
          workaroundEntityCannotBeEmpty: false,
          workaroundInstantReactiveMariaDB: false,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control, application: { authenticationTypeOauth2, generateUserManagement, cypressDir } }) {
        if (control.isJhipsterVersionLessThan('7.0.0-beta.1')) {
          this.removeFile(`${cypressDir}support/keycloak-oauth2.ts`);
          this.removeFile(`${cypressDir}fixtures/users/user.json`);
        }
        if (control.isJhipsterVersionLessThan('7.8.2')) {
          this.removeFile('cypress.json');
          this.removeFile('cypress-audits.json');

          this.removeFile(`${cypressDir}integration/administration/administration.spec.ts`);
          this.removeFile(`${cypressDir}integration/lighthouse.audits.ts`);
          if (!authenticationTypeOauth2) {
            this.removeFile(`${cypressDir}integration/account/login-page.spec.ts`);
          }
          if (generateUserManagement) {
            this.removeFile(`${cypressDir}integration/account/register-page.spec.ts`);
            this.removeFile(`${cypressDir}integration/account/settings-page.spec.ts`);
            this.removeFile(`${cypressDir}integration/account/password-page.spec.ts`);
            this.removeFile(`${cypressDir}integration/account/reset-password-page.spec.ts`);
          }
        }

        await control.cleanupFiles({ '8.6.1': [`${cypressDir}.eslintrc.json`] });
      },
      async writeFiles({ application }) {
        const faker = await createFaker();
        faker.seed(stringHashCode(application.baseName));
        const context = { ...application, faker };
        return this.writeFiles({
          sections: cypressFiles,
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
      cleanupCypressEntityFiles({ application: { cypressDir }, control, entities }) {
        for (const entity of entities) {
          if (control.isJhipsterVersionLessThan('7.8.2')) {
            this.removeFile(`${cypressDir}integration/entity/${entity.entityFileName}.spec.ts`);
          }
        }
      },

      async writeCypressEntityFiles({ application, entities }) {
        for (const entity of entities.filter(
          entity => !entity.skipClient && !entity.embedded && !entity.builtInUser && !entity.entityClientModelOnly,
        )) {
          const context = { ...application, ...entity };
          await this.writeFiles({
            sections: cypressEntityFiles,
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
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir!, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            cypress: application.nodeDependencies.cypress,
            'eslint-plugin-cypress': application.nodeDependencies['eslint-plugin-cypress'],
          },
        });
      },
      configureAudits({ application }) {
        if (!application.cypressAudit) return;
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir!, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            lighthouse: application.nodeDependencies.lighthouse,
            'cypress-audit': application.nodeDependencies['cypress-audit'],
          },
          scripts: {
            'cypress:audits': 'cypress open --e2e --config-file cypress-audits.config.js',
            'e2e:cypress:audits:headless': 'npm run e2e:cypress -- --config-file cypress-audits.config.js',
            'e2e:cypress:audits': 'cypress run --e2e --browser chrome --config-file cypress-audits.config.js',
          },
        });
      },
      configureCoverage({ application, source }) {
        const { cypressCoverage, clientFrameworkAngular, clientRootDir, dasherizedBaseName } = application;
        if (!cypressCoverage) return;
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir!, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            '@cypress/code-coverage': application.nodeDependencies['@cypress/code-coverage'],
            'babel-loader': application.nodeDependencies['babel-loader'],
            'babel-plugin-istanbul': application.nodeDependencies['babel-plugin-istanbul'],
            nyc: application.nodeDependencies.nyc,
          },
          scripts: {
            'clean-coverage': 'rimraf .nyc_output coverage',
            'pree2e:cypress:coverage': 'npm run clean-coverage && npm run ci:server:await',
            'e2e:cypress:coverage': 'npm run e2e:cypress:headed',
            'poste2e:cypress:coverage': 'nyc report',
            'prewebapp:instrumenter': 'npm run clean-www && npm run clean-coverage',
            'webapp:instrumenter': 'ng build --configuration instrumenter',
          },
        });
        if (clientFrameworkAngular) {
          // Add 'ng build --configuration instrumenter' support
          this.createStorage(`${clientRootDir}angular.json`).setPath(
            `projects.${dasherizedBaseName}.architect.build.configurations.instrumenter`,
            {},
          );
          (source as ClientSource).addWebpackConfig?.({
            config: `targetOptions.configuration === 'instrumenter'
      ? {
          module: {
            rules: [
              {
                test: /\\.(js|ts)$/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      plugins: ['istanbul'],
                    },
                  }
                ],
                enforce: 'post',
                include: path.resolve(__dirname, '../${CLIENT_MAIN_SRC_DIR}'),
                exclude: [/\\.(e2e|spec)\\.ts$/, /node_modules/, /(ngfactory|ngstyle)\\.js/],
              },
            ],
          },
        }
      : {}`,
          });
        }
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

  generateTestEntity(fields: CypressField[]) {
    return generateTestEntity(fields);
  }
}

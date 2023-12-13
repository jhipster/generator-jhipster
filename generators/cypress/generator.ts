/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { stringHashCode, createFaker } from '../base/support/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { cypressFiles, cypressEntityFiles } from './files.js';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_CYPRESS, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';

import { generateTestEntity as entityWithFakeValues } from '../client/support/index.js';

const { ANGULAR } = clientFrameworkTypes;

export default class CypressGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CYPRESS);
    }

    if (!this.delegateToBlueprint) {
      // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForCypressOptions({ control }) {
        if (control.existingProject && !this.options.askAnswered) return;
        await (this.prompt as any)(
          [
            {
              when: this.jhipsterConfig?.clientFramework === ANGULAR,
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
      prepareForTemplates({ application }) {
        application.cypressDir = application.cypressDir ?? application.clientTestDir ? `${application.clientTestDir}cypress/` : 'cypress';
        application.cypressTemporaryDir =
          application.cypressTemporaryDir ?? application.temporaryDir ? `${application.temporaryDir}cypress/` : '.cypress/';
        application.cypressBootstrapEntities = application.cypressBootstrapEntities ?? true;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareForTemplates({ entity }) {
        this._.defaults(entity, { workaroundEntityCannotBeEmpty: false, workaroundInstantReactiveMariaDB: false });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanup({ application: { authenticationTypeOauth2, generateUserManagement, cypressDir } }) {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
          this.removeFile(`${cypressDir}support/keycloak-oauth2.ts`);
          this.removeFile(`${cypressDir}fixtures/users/user.json`);
        }
        if (this.isJhipsterVersionLessThan('7.8.2')) {
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
      },
      async writeFiles({ application }) {
        const faker = await createFaker();
        faker.seed(stringHashCode(application.baseName));
        const context = { ...application, faker } as any;
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
      cleanupCypressEntityFiles({ application: { cypressDir }, entities }) {
        for (const entity of entities) {
          if (this.isJhipsterVersionLessThan('7.8.2')) {
            this.removeFile(`${cypressDir}integration/entity/${entity.entityFileName}.spec.ts`);
          }
        }
      },

      async writeCypressEntityFiles({ application, entities }) {
        for (const entity of entities) {
          const context = { ...application, ...entity } as any;
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
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('client', 'resources', 'package.json'),
        );
      },

      configure({ application }) {
        const clientPackageJson = this.createStorage(this.destinationPath(application.clientRootDir!, 'package.json'));
        clientPackageJson.merge({
          devDependencies: {
            'eslint-plugin-cypress': application.nodeDependencies['eslint-plugin-cypress'],
          },
          scripts: {
            e2e: 'npm run e2e:cypress:headed --',
            'e2e:headless': 'npm run e2e:cypress --',
            'e2e:cypress:headed': 'npm run e2e:cypress -- --headed',
            'e2e:cypress': 'cypress run --e2e --browser chrome',
            'e2e:cypress:record': 'npm run e2e:cypress -- --record',
            cypress: 'cypress open --e2e',
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
            'e2e:cypress:audits':
              // eslint-disable-next-line no-template-curly-in-string
              'cypress run --e2e --browser chrome --config-file cypress-audits.config.js',
          },
        });
      },
      configureCoverage({ application, source }) {
        const { cypressCoverage, clientFrameworkAngular, dasherizedBaseName } = application;
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
          this.createStorage('angular.json').setPath(`projects.${dasherizedBaseName}.architect.build.configurations.instrumenter`, {});
          source.addWebpackConfig?.({
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
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  generateTestEntity(references) {
    return entityWithFakeValues(references);
  }
}

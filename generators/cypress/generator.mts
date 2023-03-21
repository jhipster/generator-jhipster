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
import _ from 'lodash';

import { stringHashCode, createFaker } from '../base/support/index.mjs';
import BaseApplicationGenerator, { type Entity } from '../base-application/index.mjs';
import { cypressFiles, cypressEntityFiles } from './files.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.mjs';
import { GENERATOR_CYPRESS, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';

import type { CypressApplication } from './types.mjs';
import { generateTestEntity as entityWithFakeValues } from '../client/support/index.mjs';
import { BaseApplicationGeneratorDefinition } from '../base-application/tasks.mjs';

const { ANGULAR } = clientFrameworkTypes;

type ApplicationDefinition = {
  applicationType: CypressApplication;
  entityType: Entity;
  sourceType: Record<string, (...args: any[]) => void>;
};

export type GeneratorDefinition = BaseApplicationGeneratorDefinition<ApplicationDefinition>;

export default class CypressGenerator extends BaseApplicationGenerator<GeneratorDefinition> {
  constructor(args: any, options: any, features: any) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.loadRuntimeOptions();
  }

  async beforeQueue() {
    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_CLIENT.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CYPRESS);
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
          this.config
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
        return this.writeFiles({
          sections: cypressFiles,
          context: {
            ...application,
            faker,
          },
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
          await this.writeFiles({
            sections: cypressEntityFiles,
            context: { ...application, ...entity },
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
          this.fetchFromInstalledJHipster('client', 'templates', 'package.json')
        );
      },

      configure({ application }) {
        this.packageJson.merge({
          devDependencies: {
            'eslint-plugin-cypress': application.nodeDependencies['eslint-plugin-cypress'],
          },
        });
      },

      configureAudits({ application }) {
        if (!application.cypressAudit) return;
        this.packageJson.merge({
          devDependencies: {
            lighthouse: application.nodeDependencies.lighthouse,
            'cypress-audit': application.nodeDependencies['cypress-audit'],
          },
          scripts: {
            'cypress:audits': 'cypress open --e2e --config-file cypress-audits.config.js',
            'e2e:cypress:audits:headless': 'npm run e2e:cypress -- --config-file cypress-audits.config.js',
            'e2e:cypress:audits':
              // eslint-disable-next-line no-template-curly-in-string
              'cypress run --e2e --browser chrome --record ${CYPRESS_ENABLE_RECORD:-false} --config-file cypress-audits.config.js',
          },
        });
      },
      configureCoverage({ application }) {
        const { cypressCoverage, clientFramework, clientFrameworkAngular, dasherizedBaseName } = application;
        if (!cypressCoverage) return;
        this.packageJson.merge({
          devDependencies: {
            '@cypress/code-coverage': application.nodeDependencies['@cypress/code-coverage'],
            'babel-loader': application.nodeDependencies['babel-loader'],
            'babel-plugin-istanbul': application.nodeDependencies['babel-plugin-istanbul'],
            nyc: application.nodeDependencies.nyc,
          },
          scripts: {
            'clean-coverage': 'rimraf .nyc_output coverage',
            'pree2e:cypress:coverage': 'npm run clean coverage && npm run ci:server:await',
            'e2e:cypress:coverage': 'npm run e2e:cypress:headed',
            'poste2e:cypress:coverage': 'nyc report',
            'prewebapp:instrumenter': 'npm run clean-www && npm run clean-coverage',
            'webapp:instrumenter': 'ng build --configuration instrumenter',
          },
        });
        if (clientFrameworkAngular) {
          // Add 'ng build --configuration instrumenter' support
          this.createStorage('angular.json').setPath(`projects.${dasherizedBaseName}.architect.build.configurations.instrumenter`, {});
          this.addWebpackConfig(
            `targetOptions.configuration === 'instrumenter'
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
            clientFramework
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  generateTestEntity(references, index = 'random') {
    return entityWithFakeValues(references);
  }
}

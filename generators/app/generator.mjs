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
/* eslint-disable consistent-return, import/no-named-as-default-member */
import chalk from 'chalk';
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { checkNode } from './support/index.mjs';
import cleanupOldFilesTask from './cleanup.mjs';
import prompts from './prompts.mjs';
import statistics from '../statistics.mjs';
import {
  GENERATOR_APP,
  GENERATOR_COMMON,
  GENERATOR_LANGUAGES,
  GENERATOR_CLIENT,
  GENERATOR_PAGE,
  GENERATOR_SERVER,
  GENERATOR_BOOTSTRAP_APPLICATION_BASE,
} from '../generator-list.mjs';

import { applicationTypes, applicationOptions, clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const { MICROSERVICE } = applicationTypes;
const { NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;
const { JHI_PREFIX, BASE_NAME, JWT_SECRET_KEY, PACKAGE_NAME, PACKAGE_FOLDER, REMEMBER_ME_KEY } = applicationOptions.OptionNames;

export default class JHipsterAppGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('defaults', {
      description: 'Execute jhipster with default config',
      type: Boolean,
      default: false,
    });
    this.option('base-name', {
      description: 'Application base name',
      type: String,
    });
    this.option('application-type', {
      description: 'Application type to generate',
      type: String,
    });

    this.option('client-framework', {
      description: 'Provide client framework for the application',
      type: String,
    });

    // This adds support for a `--skip-client` flag
    this.option('skip-client', {
      description: 'Skip the client-side application generation',
      type: Boolean,
    });

    // This adds support for a `--skip-server` flag
    this.option('skip-server', {
      description: 'Skip the server-side application generation',
      type: Boolean,
    });

    // This adds support for a `--skip-commit-hook` flag
    this.option('skip-commit-hook', {
      description: 'Skip adding husky commit hooks',
      type: Boolean,
    });

    // This adds support for a `--skip-user-management` flag
    this.option('skip-user-management', {
      description: 'Skip the user management module during app generation',
      type: Boolean,
    });

    // This adds support for a `--skip-check-length-of-identifier` flag
    this.option('skip-check-length-of-identifier', {
      description: 'Skip check the length of the identifier, only for recent Oracle databases that support 30+ characters metadata',
      type: Boolean,
    });

    // This adds support for a `--skip-fake-data` flag
    this.option('skip-fake-data', {
      description: 'Skip generation of fake data for development',
      type: Boolean,
    });

    // This adds support for a `--with-entities` flag
    this.option('with-entities', {
      alias: 'e',
      description: 'Regenerate the existing entities if any',
      type: Boolean,
    });

    // This adds support for a `--jhi-prefix` flag
    this.option('jhi-prefix', {
      description: 'Add prefix before services, controllers and states name',
      type: String,
    });

    // This adds support for a `--entity-suffix` flag
    this.option('entity-suffix', {
      description: 'Add suffix after entities name',
      type: String,
    });

    // This adds support for a `--dto-suffix` flag
    this.option('dto-suffix', {
      description: 'Add suffix after dtos name',
      type: String,
    });

    // This adds support for a `--auth` flag
    this.option('auth', {
      description: 'Provide authentication type for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--db` flag
    this.option('db', {
      description: 'Provide DB name for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--build` flag
    this.option('build', {
      description: 'Provide build tool for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--websocket` flag
    this.option('websocket', {
      description: 'Provide websocket option for the application when skipping server side generation',
      type: String,
    });

    // This adds support for a `--search-engine` flag
    this.option('search-engine', {
      description: 'Provide search engine for the application when skipping server side generation',
      type: String,
    });

    // NOTE: Deprecated!!! Use --blueprints instead
    this.option('blueprint', {
      description: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
      type: String,
    });
    // This adds support for a `--blueprints` flag which can be used to specify one or more blueprints to use for generation
    this.option('blueprints', {
      description:
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
      type: String,
    });

    // This adds support for a `--creation-timestamp` flag which can be used create reproducible builds
    this.option('creation-timestamp', {
      description: 'Project creation timestamp (used for reproducible builds)',
      type: String,
    });

    this.option('incremental-changelog', {
      description: 'Creates incremental database changelogs',
      type: Boolean,
    });

    this.option('recreate-initial-changelog', {
      description: 'Recreate the initial database changelog based on the current config',
      type: Boolean,
    });

    this.option('legacy-db-names', {
      description: 'Generate database names with jhipster 6 compatibility.',
      type: Boolean,
    });

    this.option('ignore-errors', {
      description: "Don't fail on prettier errors.",
      type: Boolean,
    });

    this.option('native-language', {
      alias: 'n',
      description: 'Set application native language',
      type: String,
      required: false,
    });

    this.option('enable-translation', {
      description: 'Enable translation',
      type: Boolean,
      required: false,
    });

    this.option('language', {
      alias: 'l',
      description: 'Language to be added to application (existing languages are not removed)',
      type: Array,
    });

    this.option('pk-type', {
      description: 'Default primary key type (beta)',
      type: String,
    });

    this.option('reproducible', {
      description: 'Try to reproduce changelog',
      type: Boolean,
    });

    this.option('client-package-manager', {
      description: 'Force an unsupported client package manager',
      type: String,
    });

    this.option('cypress-coverage', {
      description: 'Enable Cypress code coverage report generation',
      type: Boolean,
    });

    this.option('cypress-audit', {
      description: 'Enable cypress-audit/lighthouse report generation',
      type: Boolean,
    });

    this.option('microfrontend', {
      description: 'Force generation of experimental microfrontend support',
      type: Boolean,
    });

    this.option('test-frameworks', {
      description: 'Test frameworks to be generated',
      type: Array,
    });

    this.option('reactive', {
      description: 'Generate a reactive backend',
      type: Boolean,
    });

    this.option('enable-swagger-codegen', {
      description: 'API first development using OpenAPI-generator',
      type: Boolean,
    });

    this.option('cache-provider', {
      description: 'Cache provider',
      type: String,
    });

    this.option('enable-hibernate-cache', {
      description: 'Enable hibernate cache',
      type: Boolean,
    });
  }

  async beforeQueue() {
    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_APP);
    }
  }

  get initializing() {
    return {
      validateNode() {
        if (this.skipChecks) {
          return;
        }
        checkNode(this.logger);
      },

      async checkForNewJHVersion() {
        if (!this.skipChecks) {
          await this.checkForNewVersion();
        }
      },

      validate() {
        if (this.skipServer && this.skipClient) {
          throw new Error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
      },
    };
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askForInsightOptIn: prompts.askForInsightOptIn,
      askForApplicationType: prompts.askForApplicationType,
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      setup() {
        if (this.jhipsterConfig.applicationType === MICROSERVICE) {
          this.jhipsterConfig.skipClient =
            this.jhipsterConfig.skipClient ||
            !this.jhipsterConfig.clientFramework ||
            this.jhipsterConfig.clientFramework === CLIENT_FRAMEWORK_NO;
          this.jhipsterConfig.withAdminUi = false;
          this.jhipsterConfig.skipUserManagement = true;
        } else {
          this.jhipsterConfig.skipClient = this.jhipsterConfig.skipClient || this.jhipsterConfig.clientFramework === CLIENT_FRAMEWORK_NO;
        }

        if (this.jhipsterConfig.skipClient) {
          this.jhipsterConfig.clientFramework = CLIENT_FRAMEWORK_NO;
        }
      },
      fixConfig() {
        if (this.jhipsterConfig.jhiPrefix) {
          this.jhipsterConfig.jhiPrefix = _.camelCase(this.jhipsterConfig.jhiPrefix);
        }
      },
    };
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      /**
       * Composing with others generators, must be executed after `configuring` priority to let others
       * generators `configuring` priority to run.
       *
       * Generators `server`, `client`, `common`, `languages` depends on each other.
       * We are composing in the same task so every priority are executed in parallel.
       * - compose (app) -> initializing (common) -> initializing (server) -> ...
       *
       * When composing in different tasks the result would be:
       * - composeCommon (app) -> initializing (common) -> prompting (common) -> ... -> composeServer (app) -> initializing (server) -> ...
       */
      async compose() {
        const { enableTranslation, skipServer, clientFramework } = this.jhipsterConfigWithDefaults;
        await this.composeWithJHipster(GENERATOR_COMMON);
        if (enableTranslation) {
          await this.composeWithJHipster(GENERATOR_LANGUAGES, {
            generatorOptions: { regenerate: true },
          });
        }
        if (!skipServer) {
          await this.composeWithJHipster(GENERATOR_SERVER);
        }
        if (clientFramework !== CLIENT_FRAMEWORK_NO) {
          await this.composeWithJHipster(GENERATOR_CLIENT);
        }
      },
      askForTestOpts: prompts.askForTestOpts,

      /**
       * At this point every other generator should already be configured, so, enforce defaults fallback.
       */
      saveConfigWithDefaults() {
        this.setConfigDefaults();

        this._validateAppConfiguration();
      },

      async composePages() {
        if (!this.jhipsterConfig.pages || this.jhipsterConfig.pages.length === 0) return;
        await Promise.all(
          this.jhipsterConfig.pages.map(page => {
            return this.composeWithJHipster(page.generator || GENERATOR_PAGE, {
              generatorArgs: [page.name],
              generatorOptions: {
                skipInstall: true,
                page,
              },
            });
          })
        );
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      insight({ control }) {
        const yorc = {
          ..._.omit(this.jhipsterConfig, [JHI_PREFIX, BASE_NAME, JWT_SECRET_KEY, PACKAGE_NAME, PACKAGE_FOLDER, REMEMBER_ME_KEY]),
        };
        yorc.applicationType = this.jhipsterConfig.applicationType;
        statistics.sendYoRc(yorc, control.existingProject, this.jhipsterConfig.jhipsterVersion);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupOldFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  _validateAppConfiguration(config = this.jhipsterConfig) {
    if (config.entitySuffix === config.dtoSuffix) {
      throw new Error('Entities cannot be generated as the entity suffix and DTO suffix are equals !');
    }
  }
}

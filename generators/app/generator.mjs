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
import { checkNode, loadStoredAppOptions } from './support/index.mjs';
import cleanupOldFilesTask from './cleanup.mjs';
import { askForInsightOptIn } from './prompts.mjs';
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

import { applicationTypes, applicationOptions } from '../../jdl/jhipster/index.mjs';
import command from './command.mjs';

const { MICROSERVICE } = applicationTypes;
const { JHI_PREFIX, BASE_NAME, JWT_SECRET_KEY, PACKAGE_NAME, PACKAGE_FOLDER, REMEMBER_ME_KEY } = applicationOptions.OptionNames;

export default class JHipsterAppGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    loadStoredAppOptions.call(this);

    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_APP);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
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
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },

      validate() {
        if (!this.skipChecks && this.jhipsterConfig.skipServer && this.jhipsterConfig.skipClient) {
          throw new Error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForInsightOptIn,
      async prompting({ control }) {
        if (control.existingProject && this.options.askAnswered !== true) return;
        await this.prompt(this.prepareQuestions(command.configs));
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      setup() {
        if (this.jhipsterConfig.applicationType === MICROSERVICE) {
          this.jhipsterConfig.skipUserManagement = true;
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
        const { enableTranslation, skipServer, skipClient } = this.jhipsterConfigWithDefaults;
        await this.composeWithJHipster(GENERATOR_COMMON);
        if (enableTranslation) {
          await this.composeWithJHipster(GENERATOR_LANGUAGES, {
            generatorOptions: { regenerate: true },
          });
        }
        if (!skipServer) {
          await this.composeWithJHipster(GENERATOR_SERVER);
        }
        if (!skipClient) {
          await this.composeWithJHipster(GENERATOR_CLIENT);
        }
      },

      /**
       * At this point every other generator should already be configured, so, enforce defaults fallback.
       */
      saveConfigWithDefaults() {
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
          }),
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

  _validateAppConfiguration(config = this.jhipsterConfigWithDefaults) {
    if (config.entitySuffix === config.dtoSuffix) {
      throw new Error('Entities cannot be generated as the entity suffix and DTO suffix are equals !');
    }
  }
}

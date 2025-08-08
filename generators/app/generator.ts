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

import chalk from 'chalk';
import { camelCase } from 'lodash-es';

import { APPLICATION_TYPE_MICROSERVICE } from '../../lib/core/application-types.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Entity as CommonEntity,
  Options as CommonOptions,
} from '../common/types.ts';
import { GENERATOR_CLIENT, GENERATOR_COMMON, GENERATOR_SERVER } from '../generator-list.ts';
import { getDefaultAppName } from '../project-name/support/index.ts';

import cleanupOldFilesTask from './cleanup.ts';
import { checkNode } from './support/index.ts';

export default class AppGenerator extends BaseApplicationGenerator<
  CommonEntity,
  CommonApplication<CommonEntity>,
  CommonConfig,
  CommonOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('app');
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

  get configuring() {
    return this.asConfiguringTaskGroup({
      setup() {
        if (this.jhipsterConfig.applicationType === APPLICATION_TYPE_MICROSERVICE) {
          this.jhipsterConfig.skipUserManagement = true;
        }
      },
      fixConfig() {
        if (this.jhipsterConfig.jhiPrefix) {
          this.jhipsterConfig.jhiPrefix = camelCase(this.jhipsterConfig.jhiPrefix);
        }
      },
      defaults() {
        if (!this.options.reproducible) {
          this.config.defaults({
            baseName: getDefaultAppName({ cwd: this.destinationPath() }),
            creationTimestamp: new Date().getTime(),
          });
        }
      },
      loadGlobalConfig() {
        if (!this.options.reproducible) {
          const globalConfig = this._globalConfig.getAll();
          if (Object.keys(globalConfig).length > 0) {
            this.log.warn('Using global configuration values:', globalConfig);
            this.config.defaults(globalConfig);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composingComponent() {
    return this.asComposingComponentTaskGroup({
      /**
       * Composing with others generators, must be executed after `configuring` priority to let others
       * generators `configuring` priority to run.
       *
       * Composing in different tasks the result would be:
       * - composeCommon (app) -> initializing (common) -> prompting (common) -> ... -> composeServer (app) -> initializing (server) -> ...
       *
       * This behaviour allows a more consistent blueprint support.
       */
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON);
      },
      async composeServer() {
        if (!this.jhipsterConfigWithDefaults.skipServer) {
          await this.composeWithJHipster(GENERATOR_SERVER);
        }
      },
      async composeClient() {
        if (!this.jhipsterConfigWithDefaults.skipClient) {
          await this.composeWithJHipster(GENERATOR_CLIENT);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING_COMPONENT]() {
    return this.delegateTasksToBlueprint(() => this.composingComponent);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupOldFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}

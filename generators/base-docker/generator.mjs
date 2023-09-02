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

import prompts from './docker-prompts.mjs';
import BaseWorkspacesGenerator from '../base-workspaces/index.mjs';
import { GENERATOR_DOCKER_COMPOSE } from '../generator-list.mjs';
import { loadFromYoRc, checkDocker, checkImages, generateJwtSecret } from './docker-base.mjs';
import statistics from '../statistics.mjs';
import { loadDockerDependenciesTask } from '../base-workspaces/internal/index.mjs';

/**
 * @class
 * @extends {BaseWorkspacesGenerator}
 */
export default class BaseDockerGenerator extends BaseWorkspacesGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    // This adds support for a `--skip-prompts` flag
    this.option('skip-prompts', {
      description: 'Generate pre-existing configuration',
      type: Boolean,
    });

    this.regenerate = this.options.skipPrompts;
  }

  get initializing() {
    return {
      loadDockerDependenciesTask,
      checkDocker,
      loadFromYoRc,
    };
  }

  get prompting() {
    return {
      askForApplicationType: prompts.askForApplicationType,
      askForGatewayType: prompts.askForGatewayType,
      askForPath: prompts.askForPath,
      askForApps: prompts.askForApps,
      askForClustersMode: prompts.askForClustersMode,
      askForMonitoring: prompts.askForMonitoring,
      askForConsoleOptions: prompts.askForConsoleOptions,
      askForServiceDiscovery: prompts.askForServiceDiscovery,
      askForAdminPassword: prompts.askForAdminPassword,
    };
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_DOCKER_COMPOSE);
      },

      checkImages,
      generateJwtSecret,
    };
  }
}

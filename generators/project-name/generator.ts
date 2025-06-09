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
import { CommandBaseGenerator } from '../base/index.js';
import { CONTEXT_DATA_EXISTING_PROJECT } from '../base/support/constants.js';
import { getDefaultAppName } from './support/index.js';

import { validateProjectName } from './support/name-resolver.js';
import type command from './command.js';

export default class ProjectNameGenerator extends CommandBaseGenerator<typeof command> {
  javaApplication?: boolean;
  defaultBaseName: () => string = () =>
    getDefaultAppName({
      cwd: this.destinationPath(),
      reproducible: this.options.reproducible,
      javaApplication: this.javaApplication,
    });
  validateBaseName: (input: string) => boolean | string = (input: string) =>
    validateProjectName(input, { javaApplication: this.javaApplication });

  async beforeQueue() {
    this.getContextData(CONTEXT_DATA_EXISTING_PROJECT, {
      factory: () => Boolean(this.options.defaults || (this.jhipsterConfig.baseName !== undefined && this.config.existed)),
    });

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      parseOptions() {
        if (this.options.defaults) {
          if (!this.jhipsterConfig.baseName) {
            this.jhipsterConfig.baseName = this.defaultBaseName();
          }
        }
      },
    });
  }

  get [CommandBaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }
}

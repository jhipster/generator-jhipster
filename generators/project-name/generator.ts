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
import { stringHashCode } from '../../lib/utils/string.ts';
import { CommandBaseGenerator } from '../base/index.ts';
import { createFaker } from '../base-application/support/faker.ts';

import type command from './command.ts';
import { getDefaultAppName } from './support/index.ts';
import { validateProjectName } from './support/name-resolver.ts';

export default class ProjectNameGenerator extends CommandBaseGenerator<typeof command> {
  javaApplication = true;
  defaultBaseName: () => string = () =>
    getDefaultAppName({
      cwd: this.destinationPath(),
      reproducible: this.options.reproducible,
      javaApplication: this.javaApplication,
    });
  validateBaseName: (input: string) => boolean | string = (input: string) =>
    validateProjectName(input, { javaApplication: this.javaApplication });

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('project-name');
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

  get configuring() {
    return this.asConfiguringTaskGroup({
      async defaults() {
        if (!this.jhipsterConfig.baseName) {
          this.jhipsterConfig.baseName = this.defaultBaseName();
        }
        if (!this.jhipsterConfig.creationTimestamp) {
          if (this.options.reproducible) {
            const faker = await createFaker();
            faker.seed(stringHashCode(this.jhipsterConfig.baseName));
            this.jhipsterConfig.creationTimestamp = faker.date
              .recent({
                days: 30,
                refDate: new Date(2024, 0, 1),
              })
              .getTime();
          } else {
            this.jhipsterConfig.creationTimestamp = Date.now();
          }
        }
      },
    });
  }

  get [CommandBaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }
}

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

import BaseApplicationGenerator from '../base-application/index.ts';

import type {
  Application as SpringCloudApplication,
  Config as SpringCloudConfig,
  Entity as SpringCloudEntity,
  Options as SpringCloudOptions,
  Source as SpringCloudSource,
} from './types.ts';

/**
 * Utility class with types.
 */
export class SpringCloudApplicationGenerator extends BaseApplicationGenerator<
  SpringCloudEntity,
  SpringCloudApplication<SpringCloudEntity>,
  SpringCloudConfig,
  SpringCloudOptions,
  SpringCloudSource
> {}

export default class SpringCloudGenerator extends SpringCloudApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('spring-boot');
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeCloud() {
        const { applicationType, messageBroker } = this.jhipsterConfigWithDefaults;

        if (applicationType === 'gateway') {
          await this.composeWithJHipster('jhipster:spring-cloud:gateway');
        }

        if (messageBroker === 'kafka') {
          await this.composeWithJHipster('jhipster:spring-cloud:kafka');
        }
        if (messageBroker === 'pulsar') {
          await this.composeWithJHipster('jhipster:spring-cloud:pulsar');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }
}

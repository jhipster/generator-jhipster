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
} from './types.ts';

export default class KafkaGenerator extends BaseApplicationGenerator<
  SpringCloudEntity,
  SpringCloudApplication<SpringCloudEntity>,
  SpringCloudConfig,
  SpringCloudOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        const { messageBroker } = this.jhipsterConfig;
        await this.composeWithJHipster(`jhipster:spring-cloud-stream:${messageBroker}`);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application }) {
        application.packageInfoJavadocs?.push({
          packageName: `${application.packageName}.broker`,
          documentation: 'Spring cloud consumers and providers',
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}

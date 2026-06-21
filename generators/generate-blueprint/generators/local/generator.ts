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
import BaseSimpleApplicationGenerator from '../../../base-simple-application/index.ts';
import type {
  Application as GenerateBlueprintApplication,
  Config as GenerateBlueprintConfig,
  Options as GenerateBlueprintOptions,
} from '../../types.ts';

export default class LocalBlueprintGenerator extends BaseSimpleApplicationGenerator<
  GenerateBlueprintApplication,
  GenerateBlueprintConfig,
  GenerateBlueprintOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('generate-blueprint');
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      conditionalConfig() {
        this.config.defaults({
          dynamic: true,
          js: false,
        });
      },
    });
  }

  get [BaseSimpleApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }
}

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
import BaseGenerator from '../base/index.ts';

/**
 * Delegates to the generator matching the configured `deploymentType`.
 *
 * The dispatch used to live inline in the jdl generator, which composed with `deploymentType` directly; it only
 * works because every deploymentType value is also a generator name.
 */
export default class DeploymentGenerator extends BaseGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async delegateToDeploymentType() {
        const { deploymentType } = this.jhipsterConfig as { deploymentType?: string };
        if (!deploymentType) {
          throw new Error('A deploymentType is required to generate a deployment.');
        }
        await this.composeWithJHipster(deploymentType);
      },
    });
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }
}

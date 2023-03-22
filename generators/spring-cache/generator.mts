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
import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_SPRING_CACHE, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import writeTask from './files.mjs';
import cleanupTask from './cleanup.mjs';
import { GeneratorDefinition as SpringBootGeneratorDefinition } from '../server/index.mjs';

export default class SpringCacheGenerator extends BaseApplicationGenerator<SpringBootGeneratorDefinition> {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_CACHE);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({});
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        if ((application as any).cacheProviderRedis) {
          source.addTestSpringFactory?.({
            key: 'org.springframework.test.context.ContextCustomizerFactory',
            value: `${application.packageName}.config.RedisTestContainersSpringContextCustomizerFactory`,
          });
        }
      },
      applyGradleScript({ source, application }) {
        if (application.buildToolGradle) {
          source.applyFromGradle?.('gradle/cache');
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}

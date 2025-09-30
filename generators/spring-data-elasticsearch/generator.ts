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

import { mutateData } from '../../lib/utils/index.ts';
import { SpringBootApplicationGenerator } from '../spring-boot/generator.ts';

import cleanupElasticsearchFilesTask from './cleanup.ts';
import writeElasticsearchEntityFilesTask, { cleanupElasticsearchEntityFilesTask } from './entity-files.ts';
import writeElasticsearchFilesTask from './files.ts';

export default class ElasticsearchGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
    }
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        mutateData(entity, {
          entitySearchLayer: true,
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get writing() {
    return {
      cleanupElasticsearchFilesTask,
      writeElasticsearchFilesTask,
    };
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupElasticsearchEntityFilesTask,
      writeElasticsearchEntityFilesTask,
    };
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory!({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.TestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ source }) {
        source.addJavaDependencies?.([
          { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-elasticsearch' },
          { scope: 'test', groupId: 'org.awaitility', artifactId: 'awaitility' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'elasticsearch' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
        ]);
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

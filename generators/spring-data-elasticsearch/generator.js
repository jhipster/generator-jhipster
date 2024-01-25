/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_SPRING_DATA_ELASTICSEARCH, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeElasticsearchFilesTask from './files.js';
import cleanupElasticsearchFilesTask from './cleanup.js';
import writeElasticsearchEntityFilesTask, { cleanupElasticsearchEntityFilesTask } from './entity-files.js';
import { mutateData } from '../base/support/index.js';

export default class ElasticsearchGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_DATA_ELASTICSEARCH);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
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

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get writing() {
    return {
      cleanupElasticsearchFilesTask,
      writeElasticsearchFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupElasticsearchEntityFilesTask,
      writeElasticsearchEntityFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.TestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        if (application.buildToolMaven) {
          source.addMavenProperty?.({
            property: 'awaitility.version',
            value: application.javaDependencies.awaitility,
          });

          source.addMavenDependency?.([
            {
              groupId: 'org.springframework.boot',
              artifactId: 'spring-boot-starter-data-elasticsearch',
            },
            {
              groupId: 'org.awaitility',
              artifactId: 'awaitility',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${awaitility.version}',
              scope: 'test',
            },
            {
              groupId: 'org.apache.commons',
              artifactId: 'commons-collections4',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'junit-jupiter',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'testcontainers',
              scope: 'test',
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'elasticsearch',
              scope: 'test',
            },
          ]);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}

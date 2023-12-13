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

import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_SPRING_DATA_CASSANDRA, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeCassandraFilesTask from './files.js';
import cleanupCassandraFilesTask from './cleanup.js';
import writeCassandraEntityFilesTask, { cleanupCassandraEntityFilesTask } from './entity-files.js';

export default class CassandraGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_DATA_CASSANDRA);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      checkEntities({ entityConfig }) {
        if (entityConfig.pagination && entityConfig.pagination !== 'no') {
          throw new Error("Pagination isn't allowed when the app uses Cassandra.");
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupCassandraFilesTask,
      writeCassandraFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupCassandraEntityFilesTask,
      writeCassandraEntityFilesTask,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.CassandraTestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        const { reactive } = application;
        if (application.buildToolMaven) {
          source.addMavenProperty?.({
            property: 'cassandra-driver.version',
            value: application.javaDependencies.cassandra,
          });

          source.addMavenAnnotationProcessor?.({
            groupId: 'com.datastax.oss',
            artifactId: 'java-driver-mapper-processor',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${cassandra-driver.version}',
          });

          source.addMavenDependency?.([
            {
              groupId: 'com.datastax.oss',
              artifactId: 'java-driver-mapper-runtime',
            },
            {
              groupId: 'commons-codec',
              artifactId: 'commons-codec',
            },
            {
              groupId: 'org.lz4',
              artifactId: 'lz4-java',
            },
            {
              groupId: 'org.springframework.boot',
              artifactId: `spring-boot-starter-data-cassandra${reactive ? '-reactive' : ''}`,
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
              artifactId: 'cassandra',
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

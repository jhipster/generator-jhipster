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
import { SpringBootApplicationGenerator } from '../spring-boot/generator.ts';
import { PaginationTypes } from '../../lib/jhipster/entity-options.js';
import writeCassandraFilesTask from './files.js';
import cleanupCassandraFilesTask from './cleanup.js';
import writeCassandraEntityFilesTask, { cleanupCassandraEntityFilesTask } from './entity-files.js';

const { NO: NO_PAGINATION } = PaginationTypes;

export default class CassandraGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:domain');
    }
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      checkEntities({ entityName, entityConfig }) {
        if (entityConfig.pagination && entityConfig.pagination !== NO_PAGINATION) {
          const errorMessage = `Pagination is not supported for entity ${entityName} when the app uses Cassandra.`;
          if (!this.skipChecks) {
            throw new Error(errorMessage);
          }

          this.log.warn(errorMessage);
          entityConfig.pagination = 'no';
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupCassandraFilesTask,
      writeCassandraFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupCassandraEntityFilesTask,
      writeCassandraEntityFilesTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
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
        const { reactive, javaDependencies } = application;

        const cassandraStarter = reactive ? 'spring-boot-starter-data-cassandra-reactive' : 'spring-boot-starter-data-cassandra';
        source.addJavaDependencies?.([
          { groupId: 'org.apache.cassandra', artifactId: 'java-driver-mapper-runtime' },
          { groupId: 'commons-codec', artifactId: 'commons-codec' },
          { groupId: 'org.springframework.boot', artifactId: cassandraStarter },
          { groupId: 'org.lz4', artifactId: 'lz4-java', version: javaDependencies!['lz4-java'] },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'cassandra' },
          { scope: 'annotationProcessor', groupId: 'org.apache.cassandra', artifactId: 'java-driver-mapper-processor' },
        ]);
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

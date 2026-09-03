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
import { PaginationTypes } from '../../../../lib/jhipster/entity-options.ts';
import type { Source as LiquibaseSource } from '../../../liquibase/types.d.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

import cleanupCassandraFilesTask from './cleanup.ts';
import writeCassandraEntityFilesTask, { cleanupCassandraEntityFilesTask } from './entity-files.ts';
import writeCassandraFilesTask from './files.ts';

const { NO: NO_PAGINATION } = PaginationTypes;

export default class CassandraGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
      await this.dependsOnJHipster('jhipster:java:domain');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configMigration({ control }) {
        // Cassandra switched from the custom CQL loader to liquibase, keep the loader for existing applications.
        // Cassandra ignored databaseMigration before, so any stored value other than an explicit liquibase
        // opt-in means the application still relies on the CQL scripts.
        if (control.isJhipsterVersionLessThan('9.3.1') && this.jhipsterConfig.databaseMigration !== 'liquibase') {
          this.jhipsterConfig.databaseMigration = 'loader';
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
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

  get composing() {
    return this.asComposingTaskGroup({
      async liquibase() {
        if (this.jhipsterConfigWithDefaults.databaseMigration === 'liquibase') {
          await this.composeWithJHipster('jhipster:spring-boot:liquibase');
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        await control.cleanupFiles({
          '9.2.1': [
            `${application.javaPackageTestDir}config/CassandraTestContainersSpringContextCustomizerFactory.java`,
            `${application.javaPackageTestDir}config/EmbeddedCassandra.java`,
            `${application.srcTestResources}META-INF/spring.factories`,
          ],
          '9.3.1': [
            // The custom cql migration was replaced with liquibase, the files are kept by the loader migration
            [
              application.databaseMigrationLiquibase,
              `${application.srcMainResources}config/cql/create-keyspace-prod.cql`,
              `${application.srcMainResources}config/cql/create-keyspace.cql`,
              `${application.srcMainResources}config/cql/drop-keyspace.cql`,
              `${application.srcMainResources}config/cql/changelog/README.md`,
              `${application.srcMainResources}config/cql/changelog/00000000000000_create-tables.cql`,
              `${application.srcMainResources}config/cql/changelog/00000000000001_insert_default_users.cql`,
            ],
          ],
        });
      },
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

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      addLiquibaseChangelogs({ application, entities, source }) {
        if (!application.databaseMigrationLiquibase) return;
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn && !entity.skipDbChangelog)) {
          (source as LiquibaseSource).addLiquibaseChangelog?.({
            changelogName: `${entity.changelogDate}_added_entity_${entity.entityClass}`,
            section: 'base',
          });
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addLog({ source }) {
        source.addMainLog?.({ name: 'com.datastax.oss.driver', level: 'INFO' });
      },
      customizeApplicationProperties({ application, source }) {
        if (application.databaseMigrationLiquibase) {
          // Creation of the keyspace by the application when it does not exist yet
          source.addApplicationPropertiesClass?.({
            propertyType: 'Cassandra',
            classStructure: {
              createKeyspace: ['Boolean', 'true'],
              keyspaceReplication: ['String', `"{'class': 'SimpleStrategy', 'replication_factor': 1}"`],
            },
          });
        }
      },
      addDependencies({ application, source }) {
        const { reactive, javaDependencies } = application;

        source.addSpringBootModule?.(`spring-boot-starter-data-cassandra${reactive ? '-reactive' : ''}`, 'spring-boot-testcontainers');
        source.addJavaDependencies?.([
          { groupId: 'org.apache.cassandra', artifactId: 'java-driver-mapper-runtime' },
          { groupId: 'commons-codec', artifactId: 'commons-codec' },
          { groupId: 'at.yawk.lz4', artifactId: 'lz4-java', version: javaDependencies['lz4-java'] },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-cassandra' },
          { scope: 'annotationProcessor', groupId: 'org.apache.cassandra', artifactId: 'java-driver-mapper-processor' },
        ]);
      },
      integrationTest({ application, source }) {
        source.editJavaFile!(`${application.javaPackageTestDir}IntegrationTest.java`, {
          imports: [`${application.packageName}.config.CassandraTestContainer`],
          annotations: [
            {
              package: 'org.springframework.boot.test.context',
              annotation: 'SpringBootTest',
              parameters: (_, cb) => cb.addKeyValue('classes', 'CassandraTestContainer.class'),
            },
          ],
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

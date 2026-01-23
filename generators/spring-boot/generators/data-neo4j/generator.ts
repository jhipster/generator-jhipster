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

import { SpringBootApplicationGenerator } from '../../generator.ts';
import type { Source as SpringBootSource } from '../../index.ts';
import type { Application as SpringDataRelationalApplication } from '../data-relational/types.d.ts';

import cleanupTask from './cleanup.ts';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.ts';
import writeTask from './files.ts';

const GENERATOR_LIQUIBASE = 'liquibase';

export default class Neo4jGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
      (await this.dependsOnJHipster('jhipster:java:domain')).useJacksonIdentityInfo = true;
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        if (this.jhipsterConfigWithDefaults.databaseMigration === 'liquibase') {
          await this.composeWithJHipster(GENERATOR_LIQUIBASE);
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async preparing({ application }) {
        const relationalApplication = application as SpringDataRelationalApplication;
        relationalApplication.devLiquibaseUrl = 'jdbc:neo4j:bolt://localhost:7687';
        relationalApplication.devDatabaseUsername = '';
        relationalApplication.devDatabasePassword = '';
        relationalApplication.devJdbcDriver = null;
        relationalApplication.devHibernateDialect = null;
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      async configuringEachEntity({ entityConfig }) {
        if (entityConfig.dto && entityConfig.dto !== 'no') {
          this.log.warn(
            `The DTO option is not supported for Neo4j database. Neo4j persists the entire constellation, DTO causes the constellation to be incomplete. DTO is found in entity ${entityConfig.name}.`,
          );
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        entity.relationships.forEach(relationship => {
          relationship.persistableRelationship ??= true;
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async checkUserRelationship({ entities }) {
        entities.forEach(entity => {
          if (entity.relationships.some(relationship => relationship.otherEntity.builtInUser)) {
            this.log.warn(
              `Relationship with User entity should be avoided for Neo4j database. Neo4j persists the entire constellation, related User entity will be updated causing security problems. Relationship with User entity is found in entity ${entity.name}.`,
            );
          }
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupEntitiesTask,
      writeEntitiesTask,
    };
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        (source as SpringBootSource).addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.Neo4jTestContainersSpringContextCustomizerFactory`,
        });
      },
      addLogs({ source }) {
        source.addMainLog?.({ name: 'org.springframework.data.neo4j.cypher.unrecognized', level: 'ERROR' });
      },
      addDependencies({ application, source }) {
        source.addSpringBootModule?.('spring-boot-starter-data-neo4j');
        source.addJavaDefinitions?.(
          {
            dependencies: [
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-junit-jupiter' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers-neo4j' },
            ],
          },
          {
            condition: !application.databaseMigrationLiquibase,
            dependencies: [
              {
                groupId: 'eu.michael-simons.neo4j',
                artifactId: 'neo4j-migrations-spring-boot-starter',
                version: application.javaDependencies!['neo4j-migrations-spring-boot-starter'],
              },
            ],
          },
        );
      },
      integrationTest({ application, source }) {
        source.editJavaFile!(`${application.javaPackageTestDir}IntegrationTest.java`, {
          annotations: [{ package: `${application.packageName}.config`, annotation: 'EmbeddedNeo4j' }],
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

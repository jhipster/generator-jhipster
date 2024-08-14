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
import { GENERATOR_LIQUIBASE } from '../generator-list.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.js';

export default class Neo4jGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      ((await this.dependsOnJHipster('jhipster:java:domain')) as any).useJacksonIdentityInfo = true;
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

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async preparing({ application }) {
        const applicationAny = application as any;
        applicationAny.devLiquibaseUrl = 'jdbc:neo4j:bolt://localhost:7687';
        applicationAny.devDatabaseUsername = '';
        applicationAny.devDatabasePassword = '';
        applicationAny.devJdbcDriver = null;
        applicationAny.devHibernateDialect = null;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      async configuringEachEntity({ entityConfig }) {
        if (entityConfig.dto && entityConfig.dto !== 'no') {
          this.log.warn(
            `The DTO option is not supported for Neo4j database. Neo4j persists the entire constellation, DTO causes the constelation to be incomplete. DTO is found in entity ${entityConfig.name}.`,
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        entity.relationships.forEach(relationship => {
          if (relationship.persistableRelationship === undefined) {
            relationship.persistableRelationship = true;
          }
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async checkUserRelationship({ entities }) {
        entities.forEach(entity => {
          if (entity.relationships.some(relationship => relationship.otherEntity.builtInUser)) {
            this.log.warn(
              `Relationship with User entity should be avoided for Neo4j database. Neo4j persists the entire constelation, related User entity will be updated causing security problems. Relationship with User entity is found in entity ${entity.name}.`,
            );
          }
        });
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
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

  get writingEntities() {
    return {
      cleanupEntitiesTask,
      writeEntitiesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.Neo4jTestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        source.addJavaDefinitions?.(
          {
            dependencies: [
              { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-neo4j' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'neo4j' },
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
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

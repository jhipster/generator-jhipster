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
import { GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_LIQUIBASE, GENERATOR_SPRING_DATA_NEO4J } from '../generator-list.mjs';
import writeTask from './files.mjs';
import cleanupTask from './cleanup.mjs';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.mjs';

export default class Neo4jGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_DATA_NEO4J);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
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
        if (application.buildToolMaven) {
          source.addMavenDependency?.([
            { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-neo4j' },
            { groupId: 'org.testcontainers', artifactId: 'junit-jupiter', scope: 'test' },
            { groupId: 'org.testcontainers', artifactId: 'testcontainers', scope: 'test' },
            { groupId: 'org.testcontainers', artifactId: 'neo4j', scope: 'test' },
          ]);
          if (!application.databaseMigrationLiquibase) {
            source.addMavenDependency?.([{ groupId: 'eu.michael-simons.neo4j', artifactId: 'neo4j-migrations-spring-boot-starter' }]);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}

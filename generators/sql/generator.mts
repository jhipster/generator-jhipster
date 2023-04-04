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
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_SQL, GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_LIQUIBASE } from '../generator-list.mjs';
import writeTask from './files.mjs';
import cleanupTask from './cleanup.mjs';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.mjs';
import { isReservedTableName } from '../../jdl/jhipster/reserved-keywords.js';
import { databaseTypes } from '../../jdl/jhipster/index.mjs';
import { GeneratorDefinition as SpringBootGeneratorDefinition } from '../server/index.mjs';
import { getDBCExtraOption } from './support/database-data.mjs';

const { SQL } = databaseTypes;

export default class SqlGenerator extends BaseApplicationGenerator<SpringBootGeneratorDefinition> {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SQL);
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster(GENERATOR_LIQUIBASE);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async preparing({ application }) {
        const anyApp = application as any;
        anyApp.devDatabaseExtraOptions = getDBCExtraOption(anyApp.devDatabaseType);
        anyApp.prodDatabaseExtraOptions = getDBCExtraOption(anyApp.prodDatabaseType);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, relationship }) {
        if (application.reactive) {
          relationship.relationshipSqlSafeName = isReservedTableName(relationship.relationshipName, SQL)
            ? `e_${relationship.relationshipName}`
            : relationship.relationshipName;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
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
          value: `${application.packageName}.config.SqlTestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        if (application.buildToolMaven) {
          source.addMavenDependency?.([
            {
              groupId: 'org.springframework.boot',
              artifactId: `spring-boot-starter-data-${application.reactive ? 'r2dbc' : 'jpa'}`,
            },
            {
              groupId: 'org.testcontainers',
              artifactId: 'jdbc',
              scope: 'test',
            },
          ]);
        }
      },
      customizeMysql({ application, source }) {
        if (!(application as any).prodDatabaseTypeMysql) return;

        const inProfile = (application as any).devDatabaseTypeH2Any ? 'prod' : undefined;
        source.addMavenDependency?.({ inProfile, groupId: 'com.mysql', artifactId: 'mysql-connector-j' });
      },
      customizeMariadb({ application, source }) {
        if (!(application as any).prodDatabaseTypeMariadb) return;

        const inProfile = (application as any).devDatabaseTypeH2Any ? 'prod' : undefined;
        source.addMavenDependency?.({ inProfile, groupId: 'org.mariadb.jdbc', artifactId: 'mariadb-java-client' });
      },
      customizeMariadbR2dbc({ application, source }) {
        if (!(application as any).prodDatabaseTypeMysql && !(application as any).prodDatabaseTypeMariadb) return;

        const inProfile = (application as any).devDatabaseTypeH2Any ? 'prod' : undefined;
        if (application.reactive && application.buildToolMaven) {
          const r2dbcArtifact = { inProfile, groupId: 'org.mariadb', artifactId: 'r2dbc-mariadb'};
          // TODO drop once spring-boot manages r2dbc-mariadb version
          const r2dbcArtifactManagement = {
            ...r2dbcArtifact,
            inProfile: undefined,
            version: application.javaDependencies['r2dbc-mariadb'],
          };

          source.addMavenDependency?.(r2dbcArtifact);
          // TODO drop once spring-boot manages r2dbc-mariadb version
          source.addMavenDependencyManagement?.(r2dbcArtifactManagement);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }
}

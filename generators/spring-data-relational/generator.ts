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
import { GENERATOR_SPRING_DATA_RELATIONAL, GENERATOR_LIQUIBASE, GENERATOR_SERVER } from '../generator-list.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.js';
import { isReservedTableName } from '../../jdl/jhipster/reserved-keywords.js';
import { databaseTypes } from '../../jdl/jhipster/index.js';
import { GeneratorDefinition as SpringBootGeneratorDefinition } from '../server/index.js';
import { getDBCExtraOption, getJdbcUrl, getR2dbcUrl } from './support/index.js';
import {
  getCommonMavenDefinition,
  getDatabaseDriverForDatabase,
  getDatabaseTypeMavenDefinition,
  getH2MavenDefinition,
  getImperativeMavenDefinition,
  getReactiveMavenDefinition,
} from './internal/dependencies.js';
import command from './command.js';

const { SQL } = databaseTypes;

export default class SqlGenerator extends BaseApplicationGenerator<SpringBootGeneratorDefinition> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_DATA_RELATIONAL);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_SERVER);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
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

        anyApp.prodDatabaseDriver = getDatabaseDriverForDatabase(application.prodDatabaseType);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        entity.relationships.forEach(relationship => {
          if (relationship.persistableRelationship === undefined && relationship.relationshipType === 'many-to-many') {
            relationship.persistableRelationship = true;
          }
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
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
      addLog({ source }) {
        source.addLogbackTestLog?.({
          name: 'org.hibernate.orm.incubating',
          level: 'ERROR',
        });
      },
      addDependencies({ application, source }) {
        if (application.buildToolMaven) {
          const { reactive, javaDependencies, packageFolder, springBootDependencies } = application;
          const applicationAny = application as any;
          const { prodDatabaseType } = applicationAny;
          source.addMavenDefinition?.(getCommonMavenDefinition({ javaDependencies }));

          if (reactive) {
            source.addMavenDefinition?.(getReactiveMavenDefinition({ javaDependencies }));
          } else {
            source.addMavenDefinition?.(getImperativeMavenDefinition({ springBootDependencies }));
          }

          const inProfile = applicationAny.devDatabaseTypeH2Any ? 'prod' : undefined;
          if (applicationAny.devDatabaseTypeH2Any) {
            const h2Definitions = getH2MavenDefinition({ prodDatabaseType, packageFolder });
            source.addMavenDefinition?.(h2Definitions.jdbc);
            if (reactive) {
              source.addMavenDefinition?.(h2Definitions.r2dbc);
            }
          }
          const dbDefinitions = getDatabaseTypeMavenDefinition(prodDatabaseType, { inProfile, javaDependencies });
          source.addMavenDefinition?.(dbDefinitions.jdbc);
          if (reactive) {
            source.addMavenDefinition?.(dbDefinitions.r2dbc);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return getJdbcUrl(databaseType, options);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return getR2dbcUrl(databaseType, options);
  }
}

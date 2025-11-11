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

import BaseApplicationGenerator from '../base-application/index.ts';
import type {
  Application as SpringBootApplication,
  Config as SpringBootConfig,
  Entity as SpringBootEntity,
  Options as SpringBootOptions,
  Source as SpringBootSource,
} from '../spring-boot/types.ts';

/**
 * Orchestrates Spring Data subgenerators based on application.databaseType.
 * This generator mirrors the pattern of spring-boot, but delegates all work to
 * specific spring-data subgenerators (relational, mongodb, neo4j, cassandra, couchbase).
 */
export default class SpringDataGenerator extends BaseApplicationGenerator<
  SpringBootEntity,
  SpringBootApplication,
  SpringBootConfig,
  SpringBootOptions,
  SpringBootSource
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeDatabase() {
        // Use resolved jhipsterConfigWithDefaults for reliable lookup at composing priority.
        const databaseType = this.jhipsterConfigWithDefaults?.databaseType;
        switch (databaseType) {
          case 'sql':
            await this.composeWithJHipster('jhipster:spring-data:relational');
            break;
          case 'mongodb':
            await this.composeWithJHipster('jhipster:spring-data:mongodb');
            break;
          case 'neo4j':
            await this.composeWithJHipster('jhipster:spring-data:neo4j');
            break;
          case 'cassandra':
            await this.composeWithJHipster('jhipster:spring-data:cassandra');
            break;
          case 'couchbase':
            await this.composeWithJHipster('jhipster:spring-data:couchbase');
            break;
          default:
            // no-op for 'no' database or unsupported types
            break;
        }
        const searchEngine = this.jhipsterConfigWithDefaults?.searchEngine;
        if (searchEngine === 'elasticsearch') {
          await this.composeWithJHipster('jhipster:spring-data:elasticsearch');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }
}

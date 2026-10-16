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
import BaseSimpleApplicationGenerator from '../../../base-simple-application/index.ts';
import { mutateApplicationLoading, mutateApplicationPreparing } from '../../application.ts';
import type {
  Application as DockerApplication,
  Config as DockerConfig,
  Options as DockerOptions,
  Source as DockerSource,
} from '../../types.ts';

import {
  type DockerComposeApplication,
  addCacheDockerComposeFiles,
  addCassandraDockerComposeFiles,
  addCouchbaseDockerComposeFiles,
  addElasticsearchDockerComposeFiles,
  addMongodbDockerComposeFiles,
  addNeo4jDockerComposeFiles,
  addPlatformDockerComposeDependencies,
  addSqlDatabaseDockerComposeFiles,
} from './internal/compose-services.ts';

export default class BootstrapGenerator extends BaseSimpleApplicationGenerator<
  DockerApplication,
  DockerConfig,
  DockerOptions,
  DockerSource
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-simple-application');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults(mutateApplicationLoading);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ applicationDefaults }) {
        applicationDefaults(mutateApplicationPreparing);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get default() {
    return this.asDefaultTaskGroup({
      // The services are added once every generator prepared the application, the backend having added its `app` file.
      sqlDatabase({ application }) {
        addSqlDatabaseDockerComposeFiles(application as DockerComposeApplication);
      },
      mongodb({ application }) {
        addMongodbDockerComposeFiles(application as DockerComposeApplication);
      },
      cassandra({ application }) {
        addCassandraDockerComposeFiles(application as DockerComposeApplication);
      },
      couchbase({ application }) {
        addCouchbaseDockerComposeFiles(application as DockerComposeApplication);
      },
      neo4j({ application }) {
        addNeo4jDockerComposeFiles(application as DockerComposeApplication);
      },
      elasticsearch({ application }) {
        addElasticsearchDockerComposeFiles(application as DockerComposeApplication);
      },
      cache({ application }) {
        addCacheDockerComposeFiles(application as DockerComposeApplication);
      },
      platform({ application }) {
        addPlatformDockerComposeDependencies(application as DockerComposeApplication);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}

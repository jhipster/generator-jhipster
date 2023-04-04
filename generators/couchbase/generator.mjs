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
import { GENERATOR_COUCHBASE, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import writeCouchbaseFilesTask, { cleanupCouchbaseFilesTask } from './files.mjs';
import writeCouchbaseEntityFilesTask, { cleanupCouchbaseEntityFilesTask } from './entity-files.mjs';

export default class CouchbaseGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_COUCHBASE);
    }
  }

  get writing() {
    return {
      cleanupCouchbaseFilesTask,
      writeCouchbaseFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupCouchbaseEntityFilesTask,
      writeCouchbaseEntityFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application, source }) {
        const { reactive } = application;
        if (application.buildToolMaven) {
          source.addMavenDependency?.([
            {
              groupId: 'commons-codec',
              artifactId: 'commons-codec',
            },
            {
              groupId: 'com.couchbase.client',
              artifactId: 'java-client',
            },
            {
              groupId: 'com.github.differentway',
              artifactId: 'couchmove',
            },
            {
              groupId: 'org.springframework.boot',
              artifactId: `spring-boot-starter-data-couchbase${reactive ? '-reactive' : ''}`,
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
              artifactId: 'couchbase',
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

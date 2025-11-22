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
import { SpringBootApplicationGenerator } from '../../../spring-boot/generator.ts';

import writeCouchbaseEntityFilesTask, { cleanupCouchbaseEntityFilesTask } from './entity-files.ts';
import writeCouchbaseFilesTask, { cleanupCouchbaseFilesTask } from './files.ts';

export default class CouchbaseGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
    }
  }

  get writing() {
    return {
      cleanupCouchbaseFilesTask,
      writeCouchbaseFilesTask,
    };
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupCouchbaseEntityFilesTask,
      writeCouchbaseEntityFilesTask,
    };
  }

  get [SpringBootApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.TestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        const { reactive, javaDependencies } = application;
        source.addSpringBootModule?.(`spring-boot-starter-data-couchbase${reactive ? '-reactive' : ''}`);
        source.addJavaDependencies?.([
          { groupId: 'commons-codec', artifactId: 'commons-codec' },
          { groupId: 'com.couchbase.client', artifactId: 'java-client' },
          { groupId: 'com.github.differentway', artifactId: 'couchmove', version: javaDependencies!.couchmove },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'couchbase' },
        ]);
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

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

import BaseApplicationGenerator from '../base-application/index.js';
import writeMongodbFilesTask from './files.js';
import cleanupMongodbFilesTask from './cleanup.js';
import writeMongodbEntityFilesTask, { cleanupMongodbEntityFilesTask } from './entity-files.js';

export default class MongoDBGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
    }
  }

  get writing() {
    return {
      cleanupMongodbFilesTask,
      writeMongodbFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupMongodbEntityFilesTask,
      writeMongodbEntityFilesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory!({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.TestContainersSpringContextCustomizerFactory`,
        });
      },
      addDependencies({ application, source }) {
        const { reactive, javaDependencies } = application;
        source.addJavaDependencies?.([
          { groupId: 'io.mongock', artifactId: 'mongock-bom', type: 'pom', version: javaDependencies!['mongock-bom'], scope: 'import' },
          { groupId: 'io.mongock', artifactId: 'mongock-springboot-v3' },
          { groupId: 'org.springframework.boot', artifactId: `spring-boot-starter-data-mongodb${reactive ? '-reactive' : ''}` },
          { groupId: 'io.mongock', artifactId: reactive ? 'mongodb-reactive-driver' : 'mongodb-springdata-v4-driver' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
          { scope: 'test', groupId: 'org.testcontainers', artifactId: 'mongodb' },
        ]);
        if (reactive) {
          source.addJavaDependencies?.([
            // Mongock requires non reactive starter workaround https://github.com/mongock/mongock/issues/613.
            { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-mongodb' },
            // Mongock requires non reactive driver workaround https://github.com/mongock/mongock/issues/613.
            // switch to mongodb-reactive-driver
            { groupId: 'io.mongock', artifactId: 'mongodb-springdata-v4-driver' },
          ]);
        }
      },
      blockhound({ application, source }) {
        const { reactive } = application;
        if (reactive) {
          source.addAllowBlockingCallsInside!({ classPath: 'com.mongodb.internal.Locks', method: 'checkedWithLock' });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

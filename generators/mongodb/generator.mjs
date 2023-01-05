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
import { GENERATOR_MONGODB, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import writeMongodbFilesTask from './files.mjs';
import cleanupMongodbFilesTask from './cleanup.mjs';
import writeMongodbEntityFilesTask, { cleanupMongodbEntityFilesTask } from './entity-files.mjs';

/**
 * @typedef {import('../server/types.mjs').SpringBootApplication} SpringBootApplication
 */
/**
 * @class
 * @extends {BaseApplicationGenerator<SpringBootApplication>}
 */
export default class MongoDBGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_MONGODB);
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
}

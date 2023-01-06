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
/* eslint-disable consistent-return */
import assert from 'assert/strict';

import { threadId } from 'worker_threads';
import BaseApplicationGenerator from '../base-application/index.mjs';

import { GENERATOR_MAVEN, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import files from './files.mjs';
import { MAVEN } from './constants.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../server/types.mjs').SpringBootApplication>}
 */
export default class MavenGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { jhipsterModular: true, unique: 'namespace', ...features });

    if (this.options.help) return;

    this.config.defaults({
      buildTool: MAVEN,
    });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
      await this.composeWithBlueprints(GENERATOR_MAVEN);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async verify({ application }) {
        assert.equal(application.buildTool, MAVEN);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles() {
        await this.writeFiles({ sections: files, context: this.application });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}

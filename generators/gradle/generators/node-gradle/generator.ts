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

import BaseApplicationGenerator from '../../../base-application/index.js';
import { GENERATOR_GRADLE } from '../../../generator-list.js';
import cleanup from './cleanup.js';
import { files } from './files.js';

export default class NodeGradleGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapAplication();
      await this.dependsOnJHipster(GENERATOR_GRADLE);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async promptCommand() {
        await this.promptCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanup,
      async writing({ application }) {
        await this.writeFiles({
          sections: files,
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customize({ application, source }) {
        source.addGradlePlugin!({ id: 'jhipster.node-gradle-conventions' });
        source.addGradleBuildSrcDependencyCatalogLibraries!([
          {
            libraryName: 'node-gradle',
            module: 'com.github.node-gradle:gradle-node-plugin',
            version: application.javaDependencies!['node-gradle'],
            scope: 'implementation',
          },
        ]);

        source.addGradleProperty!({ property: 'nodeInstall', comment: '# Install and use a local version of node and npm.' });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

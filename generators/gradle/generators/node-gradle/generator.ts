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
import { GRADLE_BUILD_SRC_MAIN_DIR } from '../../../generator-constants.js';
import { JavaApplicationGenerator } from '../../../java/generator.ts';

export default class NodeGradleGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
      await this.dependsOnJHipster('gradle');
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.node-gradle-conventions.gradle`] }],
          context: application,
        });
      },
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
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

        source.addGradleProperty!({ property: 'nodeInstall', comment: 'Install and use a local version of node and npm.' });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

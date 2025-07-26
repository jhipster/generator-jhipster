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
import { JavaApplicationGenerator } from '../../../java/generator.ts';
import { GRADLE_BUILD_SRC_MAIN_DIR } from '../../../generator-constants.js';
import { GENERATOR_GRADLE } from '../../../generator-list.js';

export default class GradleJibGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
      await this.dependsOnJHipster(GENERATOR_GRADLE);
    }
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.docker-conventions.gradle`] }],
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
        const { javaDependencies } = application;
        source.addGradleBuildSrcDependencyCatalogLibraries?.([
          {
            libraryName: 'jib-plugin',
            module: 'com.google.cloud.tools:jib-gradle-plugin',
            version: javaDependencies!['gradle-jib'],
            scope: 'implementation',
          },
        ]);

        source.addGradlePlugin?.({ id: 'jhipster.docker-conventions' });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

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
import { packageJson } from '../../../../lib/index.ts';
import { JavascriptSimpleApplicationGenerator } from '../../../javascript-simple-application/generator.ts';

export default class JavaSimpleApplicationPrettierGenerator extends JavascriptSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('javascript-simple-application');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadDependencies({ application }) {
        this.loadNodeDependencies(application.nodeDependencies, {
          'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
        });
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPrettierJava({ application, source }) {
        if (source.mergePrettierConfig) {
          source.mergePrettierConfig({
            plugins: ['prettier-plugin-java'],
            overrides: [{ files: '*.java', options: { tabWidth: 4 } }],
          });
          this.packageJson.merge({
            devDependencies: {
              'prettier-plugin-java': application.nodeDependencies['prettier-plugin-java'],
            },
          });
        }
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

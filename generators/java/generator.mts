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
import { isFilePending } from 'mem-fs-editor/lib/state.js';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_JAVA, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import writeTask from './files.mjs';
import cleanupTask from './cleanup.mjs';
import { packageInfoTransform, generatedAnnotationTransform, checkJava } from './support/index.mjs';
import { JavaApplication } from './types.mjs';
import { BaseApplicationGeneratorDefinition, GenericApplicationDefinition } from '../base-application/tasks.mjs';
import { GenericSourceTypeDefinition } from '../base/tasks.mjs';
import command from './command.mjs';
import { JAVA_COMPATIBLE_VERSIONS } from '../generator-constants.mjs';

export type ApplicationDefinition = GenericApplicationDefinition<JavaApplication>;
export type GeneratorDefinition = BaseApplicationGeneratorDefinition<ApplicationDefinition & GenericSourceTypeDefinition>;

export default class JavaGenerator extends BaseApplicationGenerator<GeneratorDefinition> {
  packageInfoFile = true;

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_JAVA);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadConfig() {
        this.parseJHipsterOptions(command.options);
      },

      validateJava() {
        if (!this.skipChecks) {
          this.checkJava();
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup(this.delegateTasksToBlueprint(() => this.initializing));
  }

  get default() {
    return this.asDefaultTaskGroup({
      generatedAnnotation({ application }) {
        if (this.jhipsterConfig.withGeneratedFlag) {
          (this as any).queueTransformStream(generatedAnnotationTransform(application.packageName), {
            name: 'adding @GeneratedByJHipster annotations',
            streamOptions: { filter: file => isFilePending(file) && file.path.endsWith('.java') },
          });
        }
      },
      generatedPackageInfo({ application }) {
        if (this.packageInfoFile) {
          (this as any).queueTransformStream(
            packageInfoTransform({
              javaRoots: [this.destinationPath(application.srcMainJava), this.destinationPath(application.srcTestJava)],
              editor: this.fs,
              javadocs: {
                [`${application.packageName}.config`]: 'Application configuration.',
                [`${application.packageName}.domain`]: 'Domain objects.',
                [`${application.packageName}.repository`]: 'Repository layer.',
                [`${application.packageName}.service`]: 'Service layer.',
                [`${application.packageName}.web.rest`]: 'Rest layer.',
              },
            }),
            {
              name: 'adding package-info.java files',
              streamOptions: {
                filter: file => isFilePending(file) && file.path.endsWith('.java') && !file.path.endsWith('package-info.java'),
              },
            }
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  /**
   * Check if a supported Java is installed
   *
   * Blueprints can customize or disable java checks versions by overriding this method.
   * @example
   * // disable checks
   * checkJava() {}
   * @examples
   * // enforce java lts versions
   * checkJava() {
   *   super.checkJava(['8', '11', '17'], { throwOnError: true });
   * }
   */
  checkJava(javaCompatibleVersions = JAVA_COMPATIBLE_VERSIONS, checkResultValidation?) {
    this.validateResult(checkJava(javaCompatibleVersions), { throwOnError: false, ...checkResultValidation });
  }
}

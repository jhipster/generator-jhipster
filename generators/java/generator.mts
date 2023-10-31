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
import { isFileStateModified } from 'mem-fs-editor/state';

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
import { matchMainJavaFiles } from './support/package-info-transform.mjs';
import { entityServerFiles, enumFiles } from './entity-files.mjs';
import { getEnumInfo } from '../base-application/support/index.mjs';

export type ApplicationDefinition = GenericApplicationDefinition<JavaApplication>;
export type GeneratorDefinition = BaseApplicationGeneratorDefinition<ApplicationDefinition & GenericSourceTypeDefinition>;

export default class JavaGenerator extends BaseApplicationGenerator<GeneratorDefinition> {
  packageInfoFile!: boolean;
  generateEntities!: boolean;
  useJakartaValidation!: boolean;
  generateEnums!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_JAVA);
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadConfig() {
        this.parseJHipsterCommand(command);
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
          this.queueTransformStream(
            {
              name: 'adding @GeneratedByJHipster annotations',
              filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && file.path.endsWith('.java'),
              refresh: false,
            },
            generatedAnnotationTransform(application.packageName),
          );
        }
      },
      generatedPackageInfo({ application }) {
        const mainPackageMatch = matchMainJavaFiles(application.srcMainJava);
        if (this.packageInfoFile) {
          this.queueTransformStream(
            {
              name: 'adding package-info.java files',
              filter: file =>
                isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && mainPackageMatch.match(file.path),
              refresh: true,
            },
            packageInfoTransform({
              javaRoots: [this.destinationPath(application.srcMainJava)],
              javadocs: {
                ...Object.fromEntries(application.packageInfoJavadocs.map(doc => [doc.packageName, doc.documentation])),
                [`${application.packageName}`]: 'Application root.',
                [`${application.packageName}.config`]: 'Application configuration.',
                [`${application.packageName}.domain`]: 'Domain objects.',
                [`${application.packageName}.repository`]: 'Repository layer.',
                [`${application.packageName}.service`]: 'Service layer.',
                [`${application.packageName}.web.rest`]: 'Rest layer.',
              },
            }),
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

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      async writeServerFiles({ application, entities }) {
        if (!this.generateEntities) return;

        const { useJakartaValidation } = this;
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          await this.writeFiles({
            sections: entityServerFiles,
            context: { ...application, ...entity, useJakartaValidation },
          });
        }
      },

      async writeEnumFiles({ application, entities }) {
        if (!this.generateEnums) return;

        for (const entity of entities.filter(entity => !entity.skipServer)) {
          for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
            const enumInfo = {
              ...getEnumInfo(field, (entity as any).clientRootFolder),
              frontendAppName: (entity as any).frontendAppName,
              packageName: application.packageName,
              javaPackageSrcDir: application.javaPackageSrcDir,
              entityJavaPackageFolder: (entity as any).entityJavaPackageFolder,
              entityAbsolutePackage: (entity as any).entityAbsolutePackage || application.packageName,
            };
            await this.writeFiles({
              sections: enumFiles,
              context: enumInfo,
            });
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
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

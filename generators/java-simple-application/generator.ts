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
import { isFileStateModified } from 'mem-fs-editor/state';

import { normalizePathEnd } from '../../lib/utils/path.ts';
import BaseSimpleApplicationGenerator from '../base-simple-application/index.ts';
import { JAVA_COMPATIBLE_VERSIONS } from '../generator-constants.ts';
import {
  checkJava,
  generatedAnnotationTransform,
  isReservedJavaKeyword,
  javaMainPackageTemplatesBlock,
  matchMainJavaFiles,
  packageInfoTransform,
} from '../java/support/index.ts';
import type { Source as JavascriptSource } from '../javascript-simple-application/types.ts';

import type {
  Application as JavaSimpleApplicationApplication,
  Config as JavaSimpleApplicationConfig,
  Options as JavaSimpleApplicationOptions,
  Source as JavaSimpleApplicationSource,
} from './types.ts';

/**
 * Utility class with types.
 */
export class JavaSimpleApplicationGenerator extends BaseSimpleApplicationGenerator<
  JavaSimpleApplicationApplication,
  JavaSimpleApplicationConfig,
  JavaSimpleApplicationOptions,
  JavaSimpleApplicationSource
> {}

export default class JavaGenerator extends JavaSimpleApplicationGenerator {
  packageInfoFile!: boolean;
  projectVersion?: string;
  jhipsterDependenciesVersion?: string;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('java-simple-application');
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      validateJava() {
        if (!this.skipChecks) {
          this.checkJava();
        }
      },
    });
  }

  get [JavaSimpleApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      checkConfig() {
        const { packageName } = this.jhipsterConfigWithDefaults;
        const reservedKeyword = packageName!.split('.').find(isReservedJavaKeyword);
        if (reservedKeyword) {
          throw new Error(`The package name "${packageName}" contains a reserved Java keyword "${reservedKeyword}".`);
        }
      },
      fixConfig() {
        if (this.jhipsterConfig.packageFolder) {
          this.jhipsterConfig.packageFolder = normalizePathEnd(this.jhipsterConfig.packageFolder);
          const packageName = this.jhipsterConfig.packageFolder.split('/').filter(Boolean).join('.');
          this.jhipsterConfig.packageName ??= packageName;
          if (this.jhipsterConfig.packageName !== packageName) {
            throw new Error(
              `The package name "${this.jhipsterConfig.packageName}" does not match the package folder "${this.jhipsterConfig.packageFolder}". Using "${packageName}" as package name.`,
            );
          }
        }
      },
    });
  }

  get [JavaSimpleApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ application }) {
        if (this.jhipsterDependenciesVersion) {
          application.jhipsterDependenciesVersion = this.jhipsterDependenciesVersion;
        }
      },
    });
  }

  get [JavaSimpleApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get default() {
    return this.asDefaultTaskGroup({
      generatedAnnotation({ application }) {
        if (this.jhipsterConfig.withGeneratedFlag && application.backendTypeJavaAny) {
          this.queueTransformStream(
            {
              name: 'adding @GeneratedByJHipster annotations',
              filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && file.path.endsWith('.java'),
              refresh: false,
            },
            generatedAnnotationTransform(application.packageName!),
          );
        }
      },
      generatedPackageInfo({ application }) {
        if (!application.backendTypeJavaAny) return;

        const { srcMainJava } = application;
        if (this.packageInfoFile && srcMainJava) {
          const mainPackageMatch = matchMainJavaFiles(srcMainJava);
          const root = this.destinationPath(srcMainJava);
          this.queueTransformStream(
            {
              name: 'adding package-info.java files',
              filter: file =>
                isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && mainPackageMatch.match(file.path),
              refresh: true,
            },
            packageInfoTransform({
              javaRoots: [root],
              javadocs: {
                ...Object.fromEntries(application.packageInfoJavadocs!.map(doc => [doc.packageName, doc.documentation])),
                [`${application.packageName}`]: 'Application root.',
                [`${application.packageName}.config`]: 'Application configuration.',
                ...Object.fromEntries(
                  application
                    .entityPackages!.map(pkg => [
                      [`${pkg}.domain`, 'Domain objects.'],
                      [`${pkg}.repository`, 'Repository layer.'],
                      [`${pkg}.service`, 'Service layer.'],
                      [`${pkg}.web.rest`, 'Rest layer.'],
                    ])
                    .flat(),
                ),
              },
            }),
          );
        }
      },
    });
  }

  get [JavaSimpleApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        if (!application.backendTypeJavaAny) return;

        await this.writeFiles({
          blocks: [
            javaMainPackageTemplatesBlock({
              templates: ['GeneratedByJHipster.java'],
            }),
            { templates: ['.editorconfig.jhi.java'] },
          ],
          context: application,
        });
      },
    });
  }

  get [JavaSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPrettierJava({ application, source }) {
        const clientSource = source as JavascriptSource;
        if (clientSource.mergePrettierConfig) {
          clientSource.mergePrettierConfig({
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

  get [JavaSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
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
  checkJava(javaCompatibleVersions = JAVA_COMPATIBLE_VERSIONS, checkResultValidation?: Parameters<typeof this.validateResult>[1]) {
    this.validateResult(checkJava(javaCompatibleVersions), { throwOnError: false, ...checkResultValidation });
  }
}

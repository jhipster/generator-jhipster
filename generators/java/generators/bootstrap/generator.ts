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
import { isFileStateModified } from 'mem-fs-editor/state';
import BaseApplicationGenerator from '../../../base-application/index.js';
import { JAVA_COMPATIBLE_VERSIONS } from '../../../generator-constants.js';
import {
  addJavaAnnotation,
  addJavaImport,
  checkJava,
  generatedAnnotationTransform,
  isReservedJavaKeyword,
  javaMainPackageTemplatesBlock,
  matchMainJavaFiles,
  packageInfoTransform,
} from '../../support/index.js';

export default class BootstrapGenerator extends BaseApplicationGenerator {
  packageInfoFile!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
    }
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

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      checkConfig() {
        const { packageName } = this.jhipsterConfigWithDefaults;
        const reservedKeywork = packageName.split('.').find(isReservedJavaKeyword);
        if (reservedKeywork) {
          throw new Error(`The package name "${packageName}" contains a reserved Java keyword "${reservedKeywork}".`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefaults({ application }) {
        application.addPrettierExtensions?.(['java']);
      },
      prepareJavaApplication({ application, source }) {
        source.hasJavaProperty = (property: string) => application.javaProperties![property] !== undefined;
        source.hasJavaManagedProperty = (property: string) => application.javaManagedProperties![property] !== undefined;
      },
      needles({ source }) {
        source.editJavaFile = (file, { staticImports = [], imports = [], annotations = [] }, ...editFileCallback) =>
          this.editFile(
            file,
            ...staticImports.map(classPath => addJavaImport(classPath, { staticImport: true })),
            ...imports.map(classPath => addJavaImport(classPath)),
            ...annotations.map(annotation => addJavaAnnotation(annotation)),
            ...editFileCallback,
          );
      },
      imperativeOrReactive({ applicationDefaults }) {
        applicationDefaults({
          optionalOrMono: ({ reactive }) => (reactive ? 'Mono' : 'Optional'),
          optionalOrMonoOfNullable: ({ reactive }) => (reactive ? 'Mono.justOrEmpty' : 'Optional.ofNullable'),
          optionalOrMonoClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Mono' : 'java.util.Optional'),
          wrapMono:
            ({ reactive }) =>
            className =>
              reactive ? `Mono<${className}>` : className,
          listOrFlux: ({ reactive }) => (reactive ? 'Flux' : 'List'),
          listOrFluxClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Flux' : 'java.util.List'),
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadDomains({ application, entities }) {
        const entityPackages = [
          ...new Set([application.packageName, ...entities.map(entity => (entity as any).entityAbsolutePackage).filter(Boolean)]),
        ];
        application.entityPackages = entityPackages;
        (application as any).domains = entityPackages;
      },
      generatedAnnotation({ application }) {
        if (this.jhipsterConfig.withGeneratedFlag && application.backendTypeJavaAny) {
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

  get [BaseApplicationGenerator.DEFAULT]() {
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

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPrettierJava({ application, source }) {
        if (source.mergePrettierConfig) {
          source.mergePrettierConfig({ plugins: ['prettier-plugin-java'], overrides: [{ files: '*.java', options: { tabWidth: 4 } }] });
          this.packageJson.merge({
            devDependencies: {
              'prettier-plugin-java': application.nodeDependencies['prettier-plugin-java'],
            },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
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
  checkJava(javaCompatibleVersions = JAVA_COMPATIBLE_VERSIONS, checkResultValidation?) {
    this.validateResult(checkJava(javaCompatibleVersions), { throwOnError: false, ...checkResultValidation });
  }
}

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

import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_JAVA, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import writeTask from './files.js';
import {
  packageInfoTransform,
  generatedAnnotationTransform,
  checkJava,
  isReservedJavaKeyword,
  javaScopeToGradleScope,
} from './support/index.js';
import command from './command.js';
import { JAVA_COMPATIBLE_VERSIONS } from '../generator-constants.js';
import { matchMainJavaFiles } from './support/package-info-transform.js';
import type { JavaDependency } from './types.js';
import type { MavenDependency } from '../maven/types.js';

export default class JavaGenerator extends BaseApplicationGenerator {
  packageInfoFile!: boolean;
  generateEntities!: boolean;
  useJakartaValidation!: boolean;
  useJacksonIdentityInfo!: boolean;
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

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        const domainGenerator: any = await this.composeWithJHipster('jhipster:java:domain');
        domainGenerator.generateEntities = domainGenerator.generateEntities ?? this.generateEntities;
        domainGenerator.useJakartaValidation = domainGenerator.useJakartaValidation ?? this.useJakartaValidation;
        domainGenerator.useJacksonIdentityInfo = domainGenerator.useJacksonIdentityInfo ?? this.useJacksonIdentityInfo;
        domainGenerator.generateEnums = domainGenerator.generateEnums ?? this.generateEnums;
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareJavaApplication({ application, source }) {
        source.hasJavaProperty = (property: string) => application.javaProperties![property] !== undefined;
        source.hasJavaManagedProperty = (property: string) => application.javaManagedProperties![property] !== undefined;
        source.addJavaDependencies = (dependencies, options) => {
          if (application.buildToolMaven) {
            const annotationProcessors = dependencies.filter(dep => dep.scope === 'annotationProcessor');
            const importDependencies = dependencies.filter(dep => dep.scope === 'import');
            const commonDependencies = dependencies.filter(dep => !['annotationProcessor', 'import'].includes(dep.scope!));
            const convertVersionToRef = ({ version, versionRef, ...artifact }: JavaDependency): MavenDependency =>
              version || versionRef ? { ...artifact, version: `\${${versionRef ?? artifact.artifactId}.version}` } : artifact;
            const removeScope = ({ scope: _scope, ...artifact }: MavenDependency) => artifact;

            source.addMavenDefinition?.({
              properties: dependencies
                .filter(dep => dep.version)
                .map(({ artifactId, version }) => ({ property: `${artifactId}.version`, value: version })),
              dependencies: [
                ...commonDependencies.map(convertVersionToRef),
                // Add a provided scope for annotation processors so that version is not required in annotationProcessor dependencies
                ...annotationProcessors.filter(dep => !dep.version).map(artifact => ({ ...artifact, scope: 'provided' })),
              ],
              dependencyManagement: importDependencies.map(convertVersionToRef),
              annotationProcessors: annotationProcessors.map(convertVersionToRef).map(removeScope),
            });
          }

          if (application.buildToolGradle) {
            source.addGradleDependencies?.(
              dependencies
                .filter(dep => !dep.version && !dep.versionRef)
                .map(({ scope, type, ...artifact }) => ({
                  ...artifact,
                  scope: javaScopeToGradleScope({ scope, type }),
                })),
              options,
            );
            source.addGradleDependencyCatalogLibraries?.(
              dependencies
                .filter(dep => dep.version || dep.versionRef)
                .map(({ scope, type, groupId, artifactId, version, versionRef }) => {
                  const library = {
                    libraryName: artifactId,
                    module: `${groupId}:${artifactId}`,
                    scope: javaScopeToGradleScope({ scope, type }),
                  };
                  return version ? { ...library, version } : { ...library, 'version.ref': versionRef! };
                }),
              options,
            );
          }
        };

        source.addJavaDefinition = (definition, options) => {
          const { dependencies, versions } = definition;
          if (dependencies) {
            source.addJavaDependencies!(
              dependencies.filter(dep => {
                if (dep.versionRef) {
                  return versions?.find(({ name }) => name === dep.versionRef)?.version;
                }
                return true;
              }),
              options,
            );
          }
          if (versions) {
            if (application.buildToolMaven) {
              source.addMavenDefinition!({
                properties: versions.filter(v => v.version).map(({ name, version }) => ({ property: `${name}.version`, value: version })),
              });
            }
            if (application.buildToolGradle) {
              source.addGradleDependencyCatalogVersions?.(versions, options);
            }
          }
        };
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
        const mainPackageMatch = matchMainJavaFiles(application.srcMainJava!);
        if (this.packageInfoFile) {
          this.queueTransformStream(
            {
              name: 'adding package-info.java files',
              filter: file =>
                isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && mainPackageMatch.match(file.path),
              refresh: true,
            },
            packageInfoTransform({
              javaRoots: [this.destinationPath(application.srcMainJava!)],
              javadocs: {
                ...Object.fromEntries(application.packageInfoJavadocs!.map(doc => [doc.packageName, doc.documentation])),
                [`${application.packageName}`]: 'Application root.',
                [`${application.packageName}.config`]: 'Application configuration.',
                ...Object.fromEntries(
                  application.entityPackages!.map(pkg => [
                    [`${pkg}.domain`, 'Domain objects.'],
                    [`${pkg}.repository`, 'Repository layer.'],
                    [`${pkg}.service`, 'Service layer.'],
                    [`${pkg}.web.rest`, 'Rest layer.'],
                  ]),
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

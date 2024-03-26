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
import cleanupTask from './cleanup.js';
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
import { entityServerFiles, enumFiles } from './entity-files.js';
import { getEnumInfo } from '../base-application/support/index.js';
import { mutateData } from '../base/support/index.js';
import { javaBeanCase } from '../server/support/index.js';
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
    return this.asInitializingTaskGroup(this.delegateTasksToBlueprint(() => this.initializing));
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
    return this.asConfiguringTaskGroup(this.delegateTasksToBlueprint(() => this.configuring));
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

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        mutateData(entity, {
          entityDomainLayer: true,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntity({ entity, field }) {
        field.propertyJavaBeanName = javaBeanCase(field.propertyName);
        if (entity.dtoMapstruct || entity.builtIn) {
          field.propertyDtoJavaType = field.blobContentTypeText ? 'String' : field.fieldType;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareEntity({ entity, relationship }) {
        relationship.propertyJavaBeanName = javaBeanCase(relationship.propertyName);
        if (entity.dtoMapstruct) {
          relationship.propertyDtoJavaType = relationship.collection
            ? `Set<${relationship.otherEntity.dtoClass}>`
            : relationship.otherEntity.dtoClass;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      checkForCircularRelationships({ entity }) {
        entity.skipJunitTests = entity.hasCyclicRequiredRelationship ? 'Cyclic required relationships detected' : undefined;
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.asPostPreparingEachEntityTaskGroup(this.delegateTasksToBlueprint(() => this.postPreparingEachEntity));
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
                [`${application.packageName}.domain`]: 'Domain objects.',
                [`${application.packageName}.repository`]: 'Repository layer.',
                [`${application.packageName}.service`]: 'Service layer.',
                [`${application.packageName}.web.rest`]: 'Rest layer.',
              },
            }),
          );
        }
      },
      loadDomains({ application, entities }) {
        (application as any).domains = [
          ...new Set([application.packageName, ...entities.map(entity => (entity as any).entityAbsolutePackage).filter(Boolean)]),
        ];
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

        const { useJakartaValidation, useJacksonIdentityInfo } = this;
        for (const entity of entities.filter(entity => !entity.skipServer)) {
          await this.writeFiles({
            sections: entityServerFiles,
            context: { ...application, ...entity, useJakartaValidation, useJacksonIdentityInfo },
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

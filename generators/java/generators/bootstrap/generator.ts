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
import { basename } from 'node:path';
import pluralize from 'pluralize';
import { isFileStateModified } from 'mem-fs-editor/state';
import { upperFirst } from 'lodash-es';
import { JavaApplicationGenerator } from '../../generator.ts';
import type { Application as JavascriptApplication, Source as JavascriptSource } from '../../../javascript/types.js';
import { JAVA_COMPATIBLE_VERSIONS, JHIPSTER_DEPENDENCIES_VERSION } from '../../../generator-constants.js';
import {
  addJavaAnnotation,
  addJavaImport,
  checkJava,
  createEnumNeedleCallback,
  generatedAnnotationTransform,
  injectJavaConstructorParam,
  injectJavaConstructorSetter,
  injectJavaField,
  isReservedJavaKeyword,
  javaMainPackageTemplatesBlock,
  matchMainJavaFiles,
  packageInfoTransform,
  prepareEntity,
} from '../../support/index.js';
import { mutateData, normalizePathEnd } from '../../../../lib/utils/index.js';

export default class JavaBootstrapGenerator extends JavaApplicationGenerator {
  packageInfoFile!: boolean;
  projectVersion?: string;
  jhipsterDependenciesVersion?: string;
  writeBootstrapFiles = true;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      const projectNameGenerator = await this.dependsOnJHipster('project-name');
      projectNameGenerator.javaApplication = true;
      // TODO depends on application-server
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

  get [JavaApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      checkConfig() {
        const { packageName } = this.jhipsterConfigWithDefaults;
        const reservedKeywork = packageName!.split('.').find(isReservedJavaKeyword);
        if (reservedKeywork) {
          throw new Error(`The package name "${packageName}" contains a reserved Java keyword "${reservedKeywork}".`);
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

  get [JavaApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      setupServerconsts({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          javaCompatibleVersions: JAVA_COMPATIBLE_VERSIONS,
          projectVersion: application => {
            if (this.projectVersion) {
              this.log.info(`Using projectVersion: ${this.projectVersion}`);
              return this.projectVersion;
            }
            return application.projectVersion ?? '0.0.1-SNAPSHOT';
          },
          jhipsterDependenciesVersion: application => {
            if (this.useVersionPlaceholders) {
              return 'JHIPSTER_DEPENDENCIES_VERSION';
            } else if (this.jhipsterDependenciesVersion) {
              this.log.info(`Using jhipsterDependenciesVersion: ${application.jhipsterDependenciesVersion}`);
              return this.jhipsterDependenciesVersion;
            }
            return JHIPSTER_DEPENDENCIES_VERSION;
          },
        });
      },
      loadEnvironmentVariables({ application }) {
        application.packageInfoJavadocs?.push(
          { packageName: `${application.packageName}.aop.logging`, documentation: 'Logging aspect.' },
          { packageName: `${application.packageName}.management`, documentation: 'Application management.' },
          { packageName: `${application.packageName}.repository.rowmapper`, documentation: 'Webflux database column mapper.' },
          { packageName: `${application.packageName}.security`, documentation: 'Application security utilities.' },
          { packageName: `${application.packageName}.service.dto`, documentation: 'Data transfer objects for rest mapping.' },
          { packageName: `${application.packageName}.service.mapper`, documentation: 'Data transfer objects mappers.' },
          { packageName: `${application.packageName}.web.filter`, documentation: 'Request chain filters.' },
          { packageName: `${application.packageName}.web.rest.errors`, documentation: 'Rest layer error handling.' },
          { packageName: `${application.packageName}.web.rest.vm`, documentation: 'Rest layer visual models.' },
        );

        if (application.defaultPackaging === 'war') {
          this.log.info(`Using ${application.defaultPackaging} as default packaging`);
        }
      },
    });
  }

  get [JavaApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefaults({ application, applicationDefaults }) {
        (application as unknown as JavascriptApplication).addPrettierExtensions?.(['java']);
        applicationDefaults({
          useNpmWrapper: application => Boolean(application.clientFrameworkAny && application.backendTypeJavaAny),
        });
      },
      prepareJavaApplication({ application, source }) {
        source.hasJavaProperty = (property: string) => application.javaProperties![property] !== undefined;
        source.hasJavaManagedProperty = (property: string) => application.javaManagedProperties![property] !== undefined;
      },
      editJavaFileNeedles({ source }) {
        source.editJavaFile = (
          file,
          { staticImports = [], imports = [], annotations = [], constructorParams = [], fields = [], springBeans = [] },
          ...editFileCallback
        ) => {
          const className = basename(file, '.java');
          return this.editFile(
            file,
            ...staticImports.map(classPath => addJavaImport(classPath, { staticImport: true })),
            ...imports.map(classPath => addJavaImport(classPath)),
            ...annotations.map(annotation => addJavaAnnotation(annotation)),
            constructorParams.length > 0 ? injectJavaConstructorParam({ className, param: constructorParams }) : c => c,
            fields.length > 0 ? injectJavaField({ className, field: fields }) : c => c,
            ...springBeans
              .map(({ package: javaPackage, beanClass, beanName }) => [
                addJavaImport(`${javaPackage}.${beanClass}`),
                injectJavaField({ className, field: `private final ${beanClass} ${beanName};` }),
                injectJavaConstructorParam({ className, param: `${beanClass} ${beanName}` }),
                injectJavaConstructorSetter({ className, setter: `this.${beanName} = ${beanName};` }),
              ])
              .flat(),
            ...editFileCallback,
          );
        };
      },
      addItemsToJavaEnumFile({ source }) {
        source.addItemsToJavaEnumFile = (file: string, { enumName = basename(file, '.java'), enumValues }) =>
          this.editFile(file, createEnumNeedleCallback({ enumName, enumValues }));
      },
      imperativeOrReactive({ applicationDefaults }) {
        applicationDefaults({
          optionalOrMono: ({ reactive }) => (reactive ? 'Mono' : 'Optional'),
          optionalOrMonoOfNullable: ({ reactive }) => (reactive ? 'Mono.justOrEmpty' : 'Optional.ofNullable'),
          optionalOrMonoClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Mono' : 'java.util.Optional'),
          wrapMono: ctx => (className: string) => (ctx.reactive ? `Mono<${className}>` : className),
          listOrFlux: ({ reactive }) => (reactive ? 'Flux' : 'List'),
          listOrFluxClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Flux' : 'java.util.List'),
        });
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ application, entity }) {
        prepareEntity(entity, application);
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, relationship }) {
        mutateData(relationship, {
          relationshipNameCapitalizedPlural: ({ relationshipNameCapitalized, relationshipName }) =>
            relationshipName.length > 1 ? pluralize(relationshipNameCapitalized) : upperFirst(pluralize(relationshipName)),
          relationshipUpdateBackReference: ({ ownerSide, relationshipRightSide, otherEntity }) =>
            !otherEntity.embedded && (application.databaseTypeNeo4j ? relationshipRightSide : !ownerSide),
        });
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadDomains({ application, entities }) {
        const entityPackages = [
          ...new Set([application.packageName, ...entities.map(entity => entity.entityAbsolutePackage).filter(Boolean)]),
        ] as string[];
        application.entityPackages = entityPackages;
        application.domains = entityPackages;
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

  get [JavaApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        if (!this.writeBootstrapFiles || !application.backendTypeJavaAny) return;

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

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPrettierJava({ application, source }) {
        if (!this.writeBootstrapFiles) return;
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

  get [JavaApplicationGenerator.POST_WRITING]() {
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

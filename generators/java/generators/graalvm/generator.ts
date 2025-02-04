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
import { extname } from 'path';
import { isFileStateDeleted, isFileStateModified } from 'mem-fs-editor/state';
import { passthrough } from '@yeoman/transform';
import BaseApplicationGenerator from '../../../base-application/index.js';
import { createNeedleCallback } from '../../../base/support/needles.js';
import { addJavaAnnotation, addJavaImport } from '../../../java/support/add-java-annotation.js';
import { javaMainPackageTemplatesBlock } from '../../../java/support/files.js';
import { mavenDefinition } from './internal/maven-definition.js';
import { GRAALVM_REACHABILITY_METADATA } from './internal/constants.js';

export default class GraalvmGenerator extends BaseApplicationGenerator {
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
      forceConfig() {
        // Cache is not supported for GraalVM native image
        this.jhipsterConfig.cacheProvider ??= 'no';
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ application }) {
        application.graalvmReachabilityMetadata = this.useVersionPlaceholders
          ? 'GRAALVM_REACHABILITY_METADATA_VERSION'
          : GRAALVM_REACHABILITY_METADATA;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      load({ application }) {
        this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies!);
      },
      addNativeHint({ source, application }) {
        source.addNativeHint = ({ advanced = [], declaredConstructors = [], publicConstructors = [], resources = [] }) => {
          this.editFile(
            `${application.javaPackageSrcDir}config/NativeConfiguration.java`,
            addJavaImport('org.springframework.aot.hint.MemberCategory'),
            createNeedleCallback({
              contentToAdd: [
                ...advanced,
                ...resources.map(resource => `hints.resources().registerPattern("${resource}");`),
                ...publicConstructors.map(
                  classPath =>
                    `hints.reflection().registerType(${classPath}, (hint) -> hint.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));`,
                ),
                ...declaredConstructors.map(
                  classPath =>
                    `hints.reflection().registerType(${classPath}, (hint) -> hint.withMembers(MemberCategory.INVOKE_DECLARED_CONSTRUCTORS));`,
                ),
              ],
              needle: 'add-native-hints',
              ignoreWhitespaces: true,
            }),
          );
        };
      },
      async packageJson({ application }) {
        const { buildToolGradle, packageJsonScripts } = application;
        const scripts = buildToolGradle
          ? {
              'native-package': './gradlew nativeCompile -Pnative -Pprod -x test -x integrationTest',
              'native-package-dev': './gradlew nativeCompile -Pnative -Pdev -x test -x integrationTest',
              'native-start': './build/native/nativeCompile/native-executable',
            }
          : {
              'native-package': './mvnw package -B -ntp -Pnative,prod -DskipTests',
              'native-package-dev': './mvnw package -B -ntp -Pnative,dev,webapp -DskipTests',
              'native-start': './target/native-executable',
            };
        Object.assign(packageJsonScripts!, {
          'native-e2e': 'concurrently -k -s first -n application,e2e -c red,blue npm:native-start npm:e2e:headless',
          ...scripts,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      // workaround for https://github.com/spring-projects/spring-boot/issues/32195
      async disabledInAotModeAnnotation({ application }) {
        this.queueTransformStream(
          {
            name: 'adding @DisabledInAotMode annotations',
            filter: file =>
              !isFileStateDeleted(file) &&
              isFileStateModified(file) &&
              file.path.startsWith(this.destinationPath(application.srcTestJava!)) &&
              extname(file.path) === '.java',
            refresh: false,
          },
          passthrough(file => {
            const contents = file.contents.toString('utf8');
            if (/@(MockBean|SpyBean)/.test(contents) || (application.reactive && /@AuthenticationIntegrationTest/.test(contents))) {
              file.contents = Buffer.from(
                addJavaAnnotation(contents, { package: 'org.springframework.test.context.aot', annotation: 'DisabledInAotMode' }),
              );
            }
          }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: {
            common: [{ templates: ['README.md.jhi.native'] }],
            config: [
              javaMainPackageTemplatesBlock({
                templates: ['config/NativeConfiguration.java'],
              }),
            ],
            gradle: [
              {
                condition: ctx => ctx.buildToolGradle,
                templates: ['gradle/native.gradle'],
              },
            ],
          },
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
      async customizeGradle({ application, source }) {
        const { buildToolGradle, javaDependencies } = application;
        if (!buildToolGradle) return;

        source.addGradleDependencyCatalogPlugin!({
          addToBuild: true,
          pluginName: 'graalvm',
          id: 'org.graalvm.buildtools.native',
          version: javaDependencies!.nativeBuildTools!,
        });

        source.applyFromGradle!({ script: 'gradle/native.gradle' });
      },

      async customizeMaven({ application, source }) {
        const {
          buildToolMaven,
          reactive,
          databaseTypeSql,
          javaDependencies,
          nativeLanguageDefinition,
          languagesDefinition,
          graalvmReachabilityMetadata,
        } = application;
        if (!buildToolMaven) return;

        source.addMavenDefinition!(
          mavenDefinition({
            graalvmReachabilityMetadata,
            reactive,
            nativeBuildToolsVersion: javaDependencies!.nativeBuildTools!,
            databaseTypeSql,
            userLanguage: nativeLanguageDefinition.languageTag,
            languages: languagesDefinition?.map(def => def.languageTag) ?? [nativeLanguageDefinition.languageTag],
          }),
        );
      },

      springBootHintsConfiguration({ application, source }) {
        const { mainClass, javaPackageSrcDir, packageName, backendTypeSpringBoot } = application;

        if (backendTypeSpringBoot) {
          source.editJavaFile!(`${javaPackageSrcDir}${mainClass}.java`, {
            annotations: [
              {
                package: 'org.springframework.context.annotation',
                annotation: 'ImportRuntimeHints',
                parameters: () => `{ ${packageName}.config.NativeConfiguration.JHipsterNativeRuntimeHints.class }`,
              },
            ],
          });
        }
      },

      springBootRestErrors({ application, source }) {
        const { javaPackageSrcDir, backendTypeSpringBoot } = application;
        if (backendTypeSpringBoot) {
          source.editJavaFile!(`${javaPackageSrcDir}/web/rest/errors/FieldErrorVM.java`, {
            annotations: [
              {
                package: 'org.springframework.aot.hint.annotation',
                annotation: 'RegisterReflectionForBinding',
                parameters: () => '{ FieldErrorVM.class }',
              },
            ],
          });
        }
      },

      // workaround for arch error in backend:unit:test caused by gradle's org.graalvm.buildtools.native plugin
      springBootTechnicalStructureTest({ application, source }) {
        const { buildToolGradle, javaPackageTestDir, backendTypeSpringBoot } = application;
        if (!buildToolGradle || !backendTypeSpringBoot) return;
        source.editJavaFile!(
          `${javaPackageTestDir}/TechnicalStructureTest.java`,
          {
            staticImports: ['com.tngtech.archunit.core.domain.JavaClass.Predicates.simpleNameEndingWith'],
          },
          contents =>
            contents.includes('__BeanFactoryRegistrations')
              ? contents
              : contents.replace(
                  '.ignoreDependency(belongToAnyOf',
                  `.ignoreDependency(simpleNameEndingWith("_BeanFactoryRegistrations"), alwaysTrue())
    .ignoreDependency(belongToAnyOf`,
                ),
        );
      },
      nativeHints({ source, application }) {
        if (!application.backendTypeSpringBoot) return;

        source.addNativeHint!({
          advanced: [
            // Undertow
            'hints.reflection().registerType(sun.misc.Unsafe.class, (hint) -> hint.withMembers(MemberCategory.INVOKE_PUBLIC_METHODS));',
            // Thymeleaf template
            'hints.reflection().registerType(java.util.Locale.class, (hint) -> hint.withMembers(MemberCategory.INVOKE_PUBLIC_METHODS));',
          ],
          resources: ['i18n/*'],
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

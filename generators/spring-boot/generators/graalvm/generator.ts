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
import { javaMainPackageTemplatesBlock } from '../../../java/support/files.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class GraalvmGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('spring-boot');
    await this.dependsOnJHipster('jhipster:java-simple-application:graalvm');
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      forceConfig() {
        // Cache is not supported for GraalVM native image
        this.jhipsterConfig.cacheProvider ??= 'no';
      },
    });
  }

  get [SpringBootApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writingTemplateTask({ application }) {
        await this.writeFiles({
          sections: {
            config: [
              javaMainPackageTemplatesBlock({
                templates: ['config/NativeConfiguration.java'],
              }),
            ],
          },
          context: application,
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      springBootHintsConfiguration({ application, source }) {
        const { mainClass, javaPackageSrcDir, packageName } = application;

        source.editJavaFile!(`${javaPackageSrcDir}${mainClass}.java`, {
          annotations: [
            {
              package: 'org.springframework.context.annotation',
              annotation: 'ImportRuntimeHints',
              parameters: () => `{ ${packageName}.config.NativeConfiguration.JHipsterNativeRuntimeHints.class }`,
            },
          ],
        });
      },

      springBootRestErrors({ application, source }) {
        const { javaPackageSrcDir } = application;
        source.editJavaFile!(`${javaPackageSrcDir}/web/rest/errors/FieldErrorVM.java`, {
          annotations: [
            {
              package: 'org.springframework.aot.hint.annotation',
              annotation: 'RegisterReflectionForBinding',
              parameters: () => '{ FieldErrorVM.class }',
            },
          ],
        });
      },

      // workaround for arch error in backend:unit:test caused by gradle's org.graalvm.buildtools.native plugin
      springBootTechnicalStructureTest({ application, source }) {
        const { buildToolGradle, javaPackageTestDir } = application;
        if (!buildToolGradle) return;
        source.editJavaFile!(
          `${javaPackageTestDir}/TechnicalStructureTest.java`,
          {
            staticImports: ['com.tngtech.archunit.core.domain.JavaClass.Predicates.simpleNameEndingWith'],
          },
          contents =>
            contents.includes('__BeanFactoryRegistrations') ? contents : (
              contents.replace(
                '.ignoreDependency(belongToAnyOf',
                `.ignoreDependency(simpleNameEndingWith("_BeanFactoryRegistrations"), alwaysTrue())
    .ignoreDependency(belongToAnyOf`,
              )
            ),
        );
      },
      nativeHints({ source }) {
        source.addNativeHint?.({
          // Thymeleaf template
          publicMethods: ['java.util.Locale.class', 'java.util.Calendar[].class'],
          resources: ['i18n/**'],
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}

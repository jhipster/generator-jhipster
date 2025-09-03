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

import { editPropertiesFileCallback } from '../../../base-core/support/properties-file.ts';
import { addJavaAnnotation, addJavaImport } from '../../../java/support/add-java-annotation.ts';
import { createEnumNeedleCallback } from '../../../java/support/java-enum.ts';
import { injectJavaConstructorParam, injectJavaConstructorSetter, injectJavaField } from '../../../java/support/java-file-edit.ts';
import type { Application as JavascriptApplication } from '../../../javascript-simple-application/types.ts';
import { mutateApplication } from '../../application.ts';
import { JavaSimpleApplicationGenerator } from '../../generator.ts';

export default class BootstrapGenerator extends JavaSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-simple-application');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      setupServerconsts({ applicationDefaults }) {
        applicationDefaults(
          {
            __override__: false,
            javaVersion: this.useVersionPlaceholders ? 'JAVA_VERSION' : undefined,
            projectVersion: '0.0.1-SNAPSHOT',
            jhipsterDependenciesVersion: () => {
              if (this.useVersionPlaceholders) {
                return 'JHIPSTER_DEPENDENCIES_VERSION';
              }
              return undefined;
            },
            graalvmReachabilityMetadata: () => (this.useVersionPlaceholders ? 'GRAALVM_REACHABILITY_METADATA_VERSION' : (undefined as any)),
          },
          mutateApplication,
        );
      },
      loadEnvironmentVariables({ application }) {
        if (application.defaultPackaging === 'war') {
          this.log.info(`Using ${application.defaultPackaging} as default packaging`);
        }
      },
    });
  }

  get [JavaSimpleApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefaults({ application }) {
        (application as unknown as JavascriptApplication).addPrettierExtensions?.(['java']);
      },
      prepareJavaApplication({ application, source }) {
        source.hasJavaProperty = (property: string) => application.javaProperties![property] !== undefined;
        source.hasJavaManagedProperty = (property: string) => application.javaManagedProperties![property] !== undefined;
        source.editJUnitPlatformProperties = properties =>
          this.editFile(
            `${application.srcTestResources}junit-platform.properties`,
            { create: true },
            editPropertiesFileCallback(properties, { sortFile: true }),
          );
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
    });
  }

  get [JavaSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}

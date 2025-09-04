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
import type { RequireOneOrNone } from 'type-fest';

import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type { EditFileCallback } from '../base-core/api.ts';
import type { PropertiesFileKeyUpdate } from '../base-core/support/index.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from '../base-simple-application/types.ts';
import type { GradleNeedleOptions, Source as GradleSource } from '../gradle/types.ts';
import type { JavaAnnotation } from '../java/support/add-java-annotation.ts';
import type { MavenDefinition, Source as MavenSource } from '../maven/types.ts';

import type { JavaSimpleApplicationAddedApplicationProperties } from './application.ts';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type JavaDependencyVersion = {
  name: string;
  version: string;
};

export type JavaArtifactType = {
  type?: 'jar' | 'pom';
  scope?: 'compile' | 'provided' | 'runtime' | 'test' | 'system' | 'import' | 'annotationProcessor';
};

export type JavaArtifact = {
  groupId: string;
  artifactId: string;
  classifier?: string;
} & JavaArtifactType;

export type JavaArtifactVersion = RequireOneOrNone<{ version?: string; versionRef?: string }, 'version' | 'versionRef'>;

export type JavaDependency = JavaArtifact &
  JavaArtifactVersion & {
    exclusions?: JavaArtifact[];
  };

export type JavaDefinition = {
  versions?: JavaDependencyVersion[];
  dependencies?: JavaDependency[];
  mavenDefinition?: MavenDefinition;
};

export type JavaNeedleOptions = GradleNeedleOptions;

export type ConditionalJavaDefinition = JavaDefinition & { condition?: boolean };

export type SpringBean = { package: string; beanClass: string; beanName: string };

export type Config = Command['Config'] & BaseSimpleApplicationConfig;

export type Options = Command['Options'] & BaseSimpleApplicationOptions;

export type Source = BaseSimpleApplicationSource &
  MavenSource &
  GradleSource & {
    /**
     * Add a JavaDefinition to the application.
     * A version requires a valid version otherwise it will be ignored.
     * A dependency with versionRef requires a valid referenced version at `versions` otherwise it will be ignored.
     */
    addJavaDefinition?(definition: JavaDefinition, options?: JavaNeedleOptions): void;
    addJavaDefinitions?(
      optionsOrDefinition: JavaNeedleOptions | ConditionalJavaDefinition,
      ...definitions: ConditionalJavaDefinition[]
    ): void;
    addJavaDependencies?(dependency: JavaDependency[], options?: JavaNeedleOptions): void;
    hasJavaProperty?(propertyName: string): boolean;
    hasJavaManagedProperty?(propertyName: string): boolean;
    addMainLog?({ name, level }: { name: string; level: string }): void;
    addTestLog?({ name, level }: { name: string; level: string }): void;

    editJUnitPlatformProperties?(properties: PropertiesFileKeyUpdate[]): void;
    /**
     * Edit a Java file by adding static imports, imports and annotations.
     * Callbacks are passed to the editFile method.
     */
    editJavaFile?: (
      file: string,
      options: {
        staticImports?: string[];
        imports?: string[];
        annotations?: JavaAnnotation[];
        /**
         * Constructor parameters to add to the class.
         */
        constructorParams?: string[];
        /**
         * Fields to add to the class.
         * Requires a valid constructor.
         */
        fields?: string[];
        /**
         * Spring beans to add to the class.
         */
        springBeans?: SpringBean[];
      },
      ...editFileCallback: EditFileCallback[]
    ) => void;
    /**
     * Add enum values to a Java enum.
     *
     * @example
     * ```js
     * addItemsToJavaEnumFile('src/main/java/my/package/MyEnum.java', {
     *   enumValues: ['VALUE1', 'VALUE2'],
     * });
     * ```
     */
    addItemsToJavaEnumFile?: (
      file: string,
      options: {
        enumName?: string;
        enumValues: string[];
      },
    ) => void;
  };

export type Application = Command['Application'] & BaseSimpleApplicationApplication & JavaSimpleApplicationAddedApplicationProperties;

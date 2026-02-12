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
import {
  type MutateDataParam,
  type MutateDataPropertiesWithRequiredProperties,
  overrideMutateDataProperty,
} from '../../lib/utils/object.ts';
import { normalizePathEnd } from '../../lib/utils/path.ts';
import {
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  JAVA_COMPATIBLE_VERSIONS,
  JHIPSTER_DEPENDENCIES_VERSION,
  RECOMMENDED_JAVA_VERSION,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
} from '../generator-constants.ts';
import { getMainClassName } from '../java/support/util.ts';

import { GRAALVM_REACHABILITY_METADATA } from './generators/graalvm/internal/constants.ts';
import type { Application } from './types.ts';

export type JavaSimpleApplicationLoadingAddedApplicationProperties = {
  javaCompatibleVersions: string[];
  entityPackages: string[];

  /** Java dependency versions */
  javaDependencies: Record<string, string>;
  /** Known properties that can be used */
  javaProperties: Record<string, string | null>;
  /** Known managed properties that can be used */
  javaManagedProperties: Record<string, string | null>;
  /** Pre-defined package JavaDocs */
  packageInfoJavadocs: { packageName: string; documentation: string }[];

  domains: string[];
  javaIntegrationTestExclude: string[];
};

export type JavaSimpleApplicationPreparingAddedApplicationProperties = {
  javaVersion: string;
  mainClass: string;

  packageFolder: string;

  srcMainJava: string;
  srcMainResources: string;
  srcMainWebapp: string;
  srcTestJava: string;
  srcTestResources: string;
  srcTestJavascript: string;

  javaPackageSrcDir: string;
  javaPackageTestDir: string;

  temporaryDir?: string;

  reactive: boolean;
  buildToolUnknown?: boolean;
  buildToolExecutable?: string;

  addOpenapiGeneratorPlugin: boolean;
  graalvmReachabilityMetadata: string;

  emptyOrReactive: string;
  imperativeOrReactive: string;
  optionalOrMono: string;
  optionalOrMonoOfNullable: string;
  listOrFlux: string;
  optionalOrMonoClassPath: string;
  wrapMono: (className: string) => string;
  listOrFluxClassPath: string;
  reactorBlock: string;
  reactorBlockOptional: string;

  jhipsterDependenciesVersion?: string;
};

export type JavaSimpleApplicationAddedApplicationProperties = JavaSimpleApplicationLoadingAddedApplicationProperties &
  JavaSimpleApplicationPreparingAddedApplicationProperties;

export const mutateApplicationLoading = {
  __override__: false,

  javaCompatibleVersions: () => [...JAVA_COMPATIBLE_VERSIONS],
  entityPackages: () => [],
  javaDependencies: () => ({}),
  javaProperties: () => ({}),
  javaManagedProperties: () => ({}),
  packageInfoJavadocs: () => [],
  javaIntegrationTestExclude: () => [],
  domains: () => [],
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<Application>,
  JavaSimpleApplicationLoadingAddedApplicationProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,

  javaVersion: RECOMMENDED_JAVA_VERSION,
  mainClass: ({ baseName }) => getMainClassName({ baseName }),

  packageName: 'com.mycompany.myapp',
  packageFolder: ({ packageName }) => `${packageName!.replace(/\./g, '/')}/`,

  srcMainJava: SERVER_MAIN_SRC_DIR,
  srcMainResources: SERVER_MAIN_RES_DIR,
  srcMainWebapp: CLIENT_MAIN_SRC_DIR,
  srcTestJava: SERVER_TEST_SRC_DIR,
  srcTestResources: SERVER_TEST_RES_DIR,
  srcTestJavascript: CLIENT_TEST_SRC_DIR,

  javaPackageSrcDir: ({ srcMainJava, packageFolder }) => normalizePathEnd(`${srcMainJava}${packageFolder}`),
  javaPackageTestDir: ({ srcTestJava, packageFolder }) => normalizePathEnd(`${srcTestJava}${packageFolder}`),

  packageInfoJavadocs: overrideMutateDataProperty(({ packageInfoJavadocs, packageName }: Application) => {
    packageInfoJavadocs.push(
      { packageName: `${packageName}.aop.logging`, documentation: 'Logging aspect.' },
      { packageName: `${packageName}.management`, documentation: 'Application management.' },
      { packageName: `${packageName}.repository.rowmapper`, documentation: 'Webflux database column mapper.' },
      { packageName: `${packageName}.security`, documentation: 'Application security utilities.' },
      { packageName: `${packageName}.service.dto`, documentation: 'Data transfer objects for rest mapping.' },
      { packageName: `${packageName}.service.mapper`, documentation: 'Data transfer objects mappers.' },
      { packageName: `${packageName}.web.filter`, documentation: 'Request chain filters.' },
      { packageName: `${packageName}.web.rest.errors`, documentation: 'Rest layer error handling.' },
      { packageName: `${packageName}.web.rest.vm`, documentation: 'Rest layer visual models.' },
    );
    return packageInfoJavadocs;
  }),

  reactive: false,

  addOpenapiGeneratorPlugin: true,

  emptyOrReactive: ({ reactive }) => (reactive ? 'Reactive' : ''),
  imperativeOrReactive: ({ reactive }) => (reactive ? 'reactive' : 'imperative'),
  optionalOrMono: ({ reactive }) => (reactive ? 'Mono' : 'Optional'),
  optionalOrMonoOfNullable: ({ reactive }) => (reactive ? 'Mono.justOrEmpty' : 'Optional.ofNullable'),
  optionalOrMonoClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Mono' : 'java.util.Optional'),
  wrapMono:
    ctx =>
    (className: string): string =>
      ctx.reactive ? `Mono<${className}>` : className,
  listOrFlux: ({ reactive }) => (reactive ? 'Flux' : 'List'),
  listOrFluxClassPath: ({ reactive }) => (reactive ? 'reactor.core.publisher.Flux' : 'java.util.List'),
  reactorBlock: ({ reactive }) => (reactive ? '.block()' : ''),
  reactorBlockOptional: ({ reactive }) => (reactive ? '.blockOptional()' : ''),

  jhipsterDependenciesVersion: JHIPSTER_DEPENDENCIES_VERSION,

  withGeneratedFlag: false,
  graalvmReachabilityMetadata: GRAALVM_REACHABILITY_METADATA,
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<Application>,
  JavaSimpleApplicationPreparingAddedApplicationProperties
>;

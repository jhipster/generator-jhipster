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
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import { CLIENT_MAIN_SRC_DIR, RECOMMENDED_NODE_VERSION } from '../generator-constants.ts';

import type { Application as JavascriptSimpleApplicationApplication } from './types.ts';

export type JavascriptSimpleApplicationLoadingAddedApplicationProperties = {
  nodeDependencies: Record<string, string>;
  /** Root package.json scripts */
  packageJsonScripts: Record<string, string>;
  /** Root package.json scripts */
  clientPackageJsonScripts: Record<string, string>;

  prettierFolders: string[];
  prettierExtensions: string[];
};

export type JavascriptSimpleApplicationPreparingAddedApplicationProperties = {
  skipJhipsterDependencies?: boolean;

  nodeVersion: string;
  nodePackageManager: string;
  nodePackageManagerCommand: string;

  packageJsonNodeEngine?: boolean | string;

  clientRootDir: string;
  clientSrcDir: string;
};

export type JavascriptSimpleApplicationAddedApplicationProperties = JavascriptSimpleApplicationLoadingAddedApplicationProperties &
  JavascriptSimpleApplicationPreparingAddedApplicationProperties;

export const mutateApplicationLoading = {
  __override__: false,

  nodeDependencies: () => ({}),

  packageJsonScripts: () => ({}),
  clientPackageJsonScripts: () => ({}),

  prettierFolders: () => ['', '.blueprint/**/'],
  prettierExtensions: () => 'md,json,yml,js,cjs,mjs,ts,cts,mts'.split(','),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<JavascriptSimpleApplicationApplication>,
  JavascriptSimpleApplicationLoadingAddedApplicationProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,

  typescriptEslint: true,
  nodeVersion: RECOMMENDED_NODE_VERSION,
  nodePackageManager: 'npm',
  nodePackageManagerCommand: ({ nodePackageManager }) => nodePackageManager,

  clientRootDir: '',
  clientSrcDir: ({ clientRootDir }) => `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`,
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<JavascriptSimpleApplicationApplication>,
  JavascriptSimpleApplicationPreparingAddedApplicationProperties
>;

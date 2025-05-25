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

import type { WriteFileBlock } from '../../base-core/types.js';
import type CoreGenerator from '../../base-core/generator.js';
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_RES_DIR, SERVER_TEST_SRC_DIR } from '../../generator-constants.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';

export const replaceEntityFilePathVariables = (data: any, filePath: string) => {
  filePath = filePath
    ?.replace(/_package_/, data.packageFolder)
    ?.replace(/_entityPackage_/, data.entityJavaPackageFolder)
    ?.replace(/_mainClass_/, data.mainClass)
    ?.replace(/_persistClass_/, data.persistClass)
    ?.replace(/_entityClass_/, data.entityClass)
    ?.replace(/_dtoClass_/, data.dtoClass);
  return filePath?.includes('.jhi.') ? filePath : filePath?.replace(/_\w*/, '');
};

/**
 * Move the template to `javaPackageSrcDir` (defaults to`src/main/java/${packageFolder}/${filePath}`).
 * Removes trailing specifiers.
 */
export const moveToJavaPackageSrcDir = (data: any, filePath: string) =>
  `${data.javaPackageSrcDir}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;

/**
 * Move the template to `javaPackageTestDir` (defaults to`src/main/java/${packageFolder}/${filePath}`).
 * Removes trailing specifiers.
 */
export const moveToJavaPackageTestDir = (data: any, filePath: string) =>
  `${data.javaPackageTestDir}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;

export const moveToSrcMainResourcesDir = (data: any, filePath: string) =>
  `${data.srcMainResources}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;

type RelativeWriteFileBlock = WriteFileBlock<any, any> & { relativePath?: string };

export function javaMainPackageTemplatesBlock<Data = ApplicationType<any, any, any>>(
  blockOrRelativePath?: string,
): Pick<WriteFileBlock<Data, any>, 'path' | 'renameTo'>;
export function javaMainPackageTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function javaMainPackageTemplatesBlock(
  blockOrRelativePath: string | RelativeWriteFileBlock = '',
): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  return javaBlock({
    srcPath: `${SERVER_MAIN_SRC_DIR}_package_/`,
    destProperty: 'javaPackageSrcDir',
    blockOrRelativePath,
  });
}

export function javaMainResourceTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function javaMainResourceTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function javaMainResourceTemplatesBlock(
  blockOrRelativePath: string | RelativeWriteFileBlock = '',
): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  return javaBlock({
    srcPath: SERVER_MAIN_RES_DIR,
    destProperty: 'srcMainResources',
    blockOrRelativePath,
  });
}

export function javaTestResourceTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function javaTestResourceTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function javaTestResourceTemplatesBlock(
  blockOrRelativePath: string | RelativeWriteFileBlock = '',
): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  return javaBlock({
    srcPath: SERVER_TEST_RES_DIR,
    destProperty: 'srcTestResources',
    blockOrRelativePath,
  });
}

export function javaTestPackageTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function javaTestPackageTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function javaTestPackageTemplatesBlock(
  blockOrRelativePath: string | RelativeWriteFileBlock = '',
): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  return javaBlock({
    srcPath: `${SERVER_TEST_SRC_DIR}_package_/`,
    destProperty: 'javaPackageTestDir',
    blockOrRelativePath,
  });
}

function javaBlock({
  srcPath,
  destProperty,
  blockOrRelativePath = '',
}: {
  srcPath: string;
  destProperty: string;
  blockOrRelativePath: string | RelativeWriteFileBlock;
}): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath !== 'string' ? blockOrRelativePath : undefined;
  const blockRenameTo = typeof block?.renameTo === 'function' ? block.renameTo : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : (blockOrRelativePath.relativePath ?? '');
  return {
    path: `${srcPath}${relativePath}`,
    ...block,
    renameTo(this: CoreGenerator<any, any, any, any, any, any>, data: any, filePath: string) {
      return `${data[destProperty]}${replaceEntityFilePathVariables(data, relativePath) ?? ''}${
        replaceEntityFilePathVariables(data, blockRenameTo?.call?.(this, data, filePath) ?? filePath) ?? ''
      }`;
    },
  };
}

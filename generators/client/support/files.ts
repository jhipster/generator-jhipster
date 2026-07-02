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

import type { WriteFileBlock } from '../../base-core/api.ts';
import type CoreGenerator from '../../base-core/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../../generator-constants.ts';
import type { Application as ClientApplication } from '../types.ts';

export const replaceEntityFilePath = (data: any, filepath: string) =>
  filepath
    .replace(/_entityFolder_/, data.entityFolderName)
    .replace(/_entityFile_/, data.entityFileName)
    .replace(/_entityModel_/, data.entityModelFileName);

const CLIENT_TEMPLATES_SRC_DIR = CLIENT_MAIN_SRC_DIR;

type ClientFileBlock<Data = ClientApplication> = WriteFileBlock<Data>;
type RelativeWriteFileBlock = ClientFileBlock & {
  relativePath?: string;
};

export function clientRootTemplatesBlock(blockOrRelativePath?: string): Pick<ClientFileBlock<any>, 'path' | 'renameTo'>;
export function clientRootTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): ClientFileBlock<any>;
export function clientRootTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<ClientFileBlock<any>> {
  return clientBlock({
    srcPath: '',
    destProperty: 'clientRootDir',
    blockOrRelativePath,
  });
}

export function clientSrcTemplatesBlock(blockOrRelativePath?: string): Pick<ClientFileBlock<any>, 'path' | 'renameTo'>;
export function clientSrcTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): ClientFileBlock<any>;
export function clientSrcTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<ClientFileBlock<any>> {
  return clientBlock({
    srcPath: CLIENT_TEMPLATES_SRC_DIR,
    destProperty: 'clientSrcDir',
    blockOrRelativePath,
  });
}

export function clientApplicationTemplatesBlock(blockOrRelativePath?: string): Pick<ClientFileBlock<any>, 'path' | 'renameTo'>;
export function clientApplicationTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): ClientFileBlock<any>;
export function clientApplicationTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<ClientFileBlock<any>> {
  return clientBlock({
    srcPath: CLIENT_TEMPLATES_SRC_DIR,
    relativeToSrc: 'app/',
    destProperty: 'clientSrcDir',
    blockOrRelativePath,
  });
}

function clientBlock({
  srcPath,
  destProperty,
  blockOrRelativePath = '',
  relativeToSrc = '',
}: {
  srcPath: string;
  destProperty: string;
  blockOrRelativePath: string | RelativeWriteFileBlock;
  relativeToSrc?: string;
}): ClientFileBlock<any> | Pick<ClientFileBlock<any>, 'path' | 'renameTo'> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath === 'string' ? undefined : blockOrRelativePath;
  const blockRenameTo = typeof block?.renameTo === 'function' ? block.renameTo : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : (blockOrRelativePath.relativePath ?? '');
  return {
    path: `${srcPath}${relativeToSrc}${relativePath}`,
    ...block,
    renameTo(this: CoreGenerator, data: any, filePath: string) {
      filePath = filePath.replace(/_([a-zA-Z]*)$/g, '');
      return `${data[destProperty]}${relativeToSrc}${replaceEntityFilePath(data, relativePath) ?? ''}${
        replaceEntityFilePath(data, blockRenameTo?.call?.(this, data, filePath) ?? filePath) ?? ''
      }`;
    },
  };
}

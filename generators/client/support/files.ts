import type { WriteFileBlock } from '../../base-core/types.js';
import type CoreGenerator from '../../base-core/index.js';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../../generator-constants.js';

export const replaceEntityFilePath = (data: any, filepath: string) =>
  filepath
    .replace(/_entityFolder_/, data.entityFolderName)
    .replace(/_entityFile_/, data.entityFileName)
    .replace(/_entityModel_/, data.entityModelFileName);

const CLIENT_TEMPLATES_SRC_DIR = CLIENT_MAIN_SRC_DIR;

type RelativeWriteFileBlock = WriteFileBlock<any, any> & {
  relativePath?: string;
};

export function clientRootTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function clientRootTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function clientRootTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock<any, any>> {
  return clientBlock({
    srcPath: '',
    destProperty: 'clientRootDir',
    blockOrRelativePath,
  });
}

export function clientSrcTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function clientSrcTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function clientSrcTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock<any, any>> {
  return clientBlock({
    srcPath: CLIENT_TEMPLATES_SRC_DIR,
    destProperty: 'clientSrcDir',
    blockOrRelativePath,
  });
}

export function clientApplicationTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function clientApplicationTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function clientApplicationTemplatesBlock(
  blockOrRelativePath: string | RelativeWriteFileBlock = '',
): Partial<WriteFileBlock<any, any>> {
  return clientBlock({
    srcPath: CLIENT_TEMPLATES_SRC_DIR,
    relativeToSrc: 'app/',
    destProperty: 'clientSrcDir',
    blockOrRelativePath,
  });
}

export function clientTestTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'>;
export function clientTestTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock<any, any>;
export function clientTestTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock<any, any>> {
  return clientBlock({
    srcPath: CLIENT_TEST_SRC_DIR,
    destProperty: 'clientTestDir',
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
}): WriteFileBlock<any, any> | Pick<WriteFileBlock<any, any>, 'path' | 'renameTo'> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath !== 'string' ? blockOrRelativePath : undefined;
  const blockRenameTo = typeof block?.renameTo === 'function' ? block.renameTo : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : (blockOrRelativePath.relativePath ?? '');
  return {
    path: `${srcPath}${relativeToSrc}${relativePath}`,
    ...block,
    renameTo(this: CoreGenerator<any, any, any, any, any, any>, data: any, filePath: string) {
      return `${data[destProperty]}${relativeToSrc}${replaceEntityFilePath(data, relativePath) ?? ''}${
        replaceEntityFilePath(data, blockRenameTo?.call?.(this, data, filePath) ?? filePath) ?? ''
      }`;
    },
  };
}

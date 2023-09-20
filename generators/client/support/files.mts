import type { WriteFileBlock } from '../../base/api.mjs';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../../generator-constants.mjs';

export const replaceEntityFilePath = (data: any, filepath: string) =>
  filepath
    .replace(/_entityFolder_/, data.entityFolderName)
    .replace(/_entityFile_/, data.entityFileName)
    .replace(/_entityModel_/, data.entityFileName)
    .replace(/_entityFolder/, data.entityFolderName)
    .replace(/_entityFile/, data.entityFileName)
    .replace(/_entityModel/, data.entityModelFileName);

const srcRenameTo = (relativePath: string) => (data: any, filepath: string) =>
  `${data.clientSrcDir}${relativePath}${replaceEntityFilePath(data, filepath)}`;

const appRenameTo = (relativePath: string) => (data: any, filepath: string) =>
  `${data.clientSrcDir}app/${relativePath}${replaceEntityFilePath(data, filepath)}`;

const testRenameTo = (relativePath: string) => (data: any, filepath: string) =>
  `${data.clientTestDir}${relativePath}${replaceEntityFilePath(data, filepath)}`;

const CLIENT_TEMPLATES_SRC_DIR = CLIENT_MAIN_SRC_DIR;
const CLIENT_TEMPLATES_APP_DIR = `${CLIENT_MAIN_SRC_DIR}app/`;

type RelativeWriteFileBlock = WriteFileBlock & { relativePath?: string };

export function clientSrcTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock, 'path' | 'renameTo'>;
export function clientSrcTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock;
export function clientSrcTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath !== 'string' ? blockOrRelativePath : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : blockOrRelativePath.relativePath ?? '';
  return {
    path: `${CLIENT_TEMPLATES_SRC_DIR}${relativePath}`,
    renameTo: srcRenameTo(relativePath),
    ...block,
  };
}

export function clientApplicationTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock, 'path' | 'renameTo'>;
export function clientApplicationTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock;
export function clientApplicationTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath !== 'string' ? blockOrRelativePath : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : blockOrRelativePath.relativePath ?? '';
  return {
    path: `${CLIENT_TEMPLATES_APP_DIR}${relativePath}`,
    renameTo: appRenameTo(relativePath),
    ...block,
  };
}

export function clientTestTemplatesBlock(blockOrRelativePath?: string): Pick<WriteFileBlock, 'path' | 'renameTo'>;
export function clientTestTemplatesBlock(blockOrRelativePath: RelativeWriteFileBlock): WriteFileBlock;
export function clientTestTemplatesBlock(blockOrRelativePath: string | RelativeWriteFileBlock = ''): Partial<WriteFileBlock> {
  const block: RelativeWriteFileBlock | undefined = typeof blockOrRelativePath !== 'string' ? blockOrRelativePath : undefined;
  const relativePath: string = typeof blockOrRelativePath === 'string' ? blockOrRelativePath : blockOrRelativePath.relativePath ?? '';
  return {
    path: `${CLIENT_TEST_SRC_DIR}${relativePath}`,
    renameTo: testRenameTo(relativePath),
    ...block,
  };
}

import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../../generator-constants.mjs';

export const replaceEntityFilePath = (data: any, filepath: string) =>
  filepath
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

export const clientSrcTemplatesBlock = (relativePath: string | any = '') => {
  relativePath = typeof relativePath === 'object' ? relativePath.relativePath : relativePath;
  return {
    path: `${CLIENT_TEMPLATES_SRC_DIR}${relativePath}`,
    renameTo: srcRenameTo(relativePath),
    ...(typeof relativePath === 'object' ? relativePath : undefined),
  };
};

export const clientApplicationTemplatesBlock = (relativePath: string | any = '') => {
  relativePath = typeof relativePath === 'object' ? relativePath.relativePath : relativePath;
  return {
    path: `${CLIENT_TEMPLATES_APP_DIR}${relativePath}`,
    renameTo: appRenameTo(relativePath),
    ...(typeof relativePath === 'object' ? relativePath : undefined),
  };
};

export const clientTestTemplatesBlock = (relativePath: string | any = '') => {
  relativePath = typeof relativePath === 'object' ? relativePath.relativePath : relativePath;
  return {
    path: `${CLIENT_TEST_SRC_DIR}${relativePath}`,
    renameTo: testRenameTo(relativePath),
    ...(typeof relativePath === 'object' ? relativePath : undefined),
  };
};

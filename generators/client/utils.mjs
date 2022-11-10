import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../generator-constants.mjs';

export const replaceEntityFilePath = (data, filepath) =>
  filepath
    .replace(/_entityFolder/, data.entityFolderName)
    .replace(/_entityFile/, data.entityFileName)
    .replace(/_entityModel/, data.entityModelFileName);

export const srcRenameTo = (data, filepath) => `${data.clientSrcDir}${replaceEntityFilePath(data, filepath)}`;

export const appRenameTo = (data, filepath) => `${data.clientSrcDir}app/${replaceEntityFilePath(data, filepath)}`;

export const testRenameTo = (data, filepath) => `${data.clientTestDir}${replaceEntityFilePath(data, filepath)}`;

export const testAppRenameTo = (data, filepath) => `${data.clientTestDir}spec/app/${replaceEntityFilePath(data, filepath)}`;

export const CLIENT_TEMPLATES_SRC_DIR = CLIENT_MAIN_SRC_DIR;
export const CLIENT_TEMPLATES_APP_DIR = `${CLIENT_MAIN_SRC_DIR}app/`;
export const CLIENT_TEMPLATES_TEST_DIR = CLIENT_TEST_SRC_DIR;
export const CLIENT_TEMPLATES_APP_TEST_DIR = `${CLIENT_TEMPLATES_TEST_DIR}spec/app/`;

export const clientSrcBlock = {
  path: CLIENT_TEMPLATES_SRC_DIR,
  renameTo: srcRenameTo,
};

export const clientApplicationBlock = {
  path: CLIENT_TEMPLATES_APP_DIR,
  renameTo: appRenameTo,
};

export const clientTestBlock = {
  path: CLIENT_TEMPLATES_TEST_DIR,
  renameTo: testRenameTo,
};

export const clientAppTestBlock = {
  path: CLIENT_TEMPLATES_APP_TEST_DIR,
  renameTo: testAppRenameTo,
};

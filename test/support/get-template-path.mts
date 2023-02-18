import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const currentFilename = fileURLToPath(import.meta.url);
const currentFileDirname = dirname(currentFilename);

// eslint-disable-next-line import/prefer-default-export
export const getTemplatePath = (...templatePath: string[]) => resolve(currentFileDirname, '../templates', ...templatePath);

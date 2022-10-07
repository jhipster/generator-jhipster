import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const currentFilename = fileURLToPath(import.meta.url);
const currentFileDirname = dirname(currentFilename);

export const getTemplatePath = (...templatePath: string[]) => resolve(currentFileDirname, '../templates', ...templatePath);

export const getEntityTemplatePath = (entityName: string) => getTemplatePath('.jhipster', `${entityName}.json`);

/* eslint-disable import/prefer-default-export */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const jdlImporter = require('./jdl-importer');

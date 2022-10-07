import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line import/prefer-default-export
export const getGenerator = (generatorName: string) => resolve(__dirname, '../../generators', generatorName, 'index.mjs');

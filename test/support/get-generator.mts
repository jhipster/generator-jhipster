import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line import/prefer-default-export
export const getGenerator = (generatorName: string) => {
  const resolved = resolve(__dirname, '../../generators', generatorName, 'index.mts');
  if (existsSync(resolved)) {
    return resolved;
  }
  return resolve(__dirname, '../../generators', generatorName, 'index.mjs');
};

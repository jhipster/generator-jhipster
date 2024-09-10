import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getGeneratorFolder = (generatorName: string) => {
  return resolve(__dirname, '../generators', generatorName.split(':').join('/generators/'));
};

const getGenerator = (generatorName: string) => {
  const generatorFolder = getGeneratorFolder(generatorName);
  const resolved = resolve(generatorFolder, 'index.ts');
  if (existsSync(resolved)) {
    return resolved;
  }
  return resolve(generatorFolder, 'index.js');
};

export default getGenerator;

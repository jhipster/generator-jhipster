import { dirname, isAbsolute, join, resolve } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getGeneratorRelativeFolder = (generatorName: string) => {
  generatorName = generatorName.replace('jhipster:', '');
  return join('generators', generatorName.split(':').join('/generators/'));
};

export const getGeneratorFolder = (generatorName: string) => resolve(__dirname, '../..', getGeneratorRelativeFolder(generatorName));

const getGenerator = (generatorName: string) => {
  if (isAbsolute(generatorName)) {
    return generatorName;
  }
  const generatorFolder = getGeneratorFolder(generatorName);
  const resolved = resolve(generatorFolder, 'index.ts');
  if (existsSync(resolved)) {
    return resolved;
  }
  return resolve(generatorFolder, 'index.js');
};

export default getGenerator;

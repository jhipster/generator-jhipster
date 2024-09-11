import { resolve } from 'path';
import { existsSync } from 'fs';
import { getPackageRoot } from '../index.js';

export const getGeneratorFolder = (generatorName: string) => {
  return resolve(getPackageRoot(), 'generators', generatorName.split(':').join('/generators/'));
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

import { existsSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

import { getSourceRoot } from '../index.ts';

export const getGeneratorRelativeFolder = (generatorNamespace: string) => {
  generatorNamespace = generatorNamespace.replace('jhipster:', '');
  return join('generators', generatorNamespace.split(':').join('/generators/'));
};

export const getGeneratorFolder = (generatorNamespace: string) => resolve(getSourceRoot(), getGeneratorRelativeFolder(generatorNamespace));

const getGenerator = (generatorNamespace: string) => {
  if (isAbsolute(generatorNamespace)) {
    return generatorNamespace;
  }
  const generatorFolder = getGeneratorFolder(generatorNamespace);
  const resolved = resolve(generatorFolder, 'index.ts');
  if (existsSync(resolved)) {
    return resolved;
  }
  return resolve(generatorFolder, 'index.js');
};

export default getGenerator;

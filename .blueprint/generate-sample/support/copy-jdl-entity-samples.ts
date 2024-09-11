import { cpSync, mkdirSync, statSync } from 'fs';
import { extname, join } from 'path';
import { jdlEntitiesSamplesFolder } from '../../constants.js';

const isDirectory = dir => {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

export default function copyJdlEntitySamples(dest, ...entities) {
  mkdirSync(dest, { recursive: true });
  for (const entity of entities) {
    const samplePath = join(jdlEntitiesSamplesFolder, entity);
    if (isDirectory(samplePath)) {
      cpSync(samplePath, dest, { recursive: true });
    } else if (extname(samplePath) === '.jdl') {
      cpSync(samplePath, join(dest, entity));
    } else if (!extname(samplePath)) {
      cpSync(`${samplePath}.jdl`, join(dest, `${entity}.jdl`));
    }
  }
}

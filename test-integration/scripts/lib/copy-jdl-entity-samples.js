import { cpSync, mkdirSync, statSync } from 'fs';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const samplesFolder = join(dirname(fileURLToPath(import.meta.url)), '../../samples');
const jdlEntitiesSamplesFolder = join(samplesFolder, 'jdl-entities');

const isDirectory = dir => {
  try {
    return statSync(samplePath).isDirectory();
  } catch (error) {
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

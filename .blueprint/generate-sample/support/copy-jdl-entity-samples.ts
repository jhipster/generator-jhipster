import { cpSync, mkdirSync, statSync } from 'fs';
import { extname, join } from 'path';
import { jdlEntitiesSamplesFolder } from '../../constants.ts';

const isDirectory = (dir: string) => {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

export default function copyJdlEntitySamples(dest: string, ...entities: string[]) {
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

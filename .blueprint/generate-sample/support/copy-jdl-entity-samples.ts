import { statSync } from 'node:fs';
import { extname, join } from 'node:path';

import type { MemFsEditor } from 'mem-fs-editor';

import { jdlEntitiesSamplesFolder } from '../../constants.ts';

const isDirectory = (dir: string) => {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

export default function copyJdlEntitySamples(memFs: MemFsEditor, dest: string, ...entities: string[]) {
  for (const entity of entities) {
    const samplePath = join(jdlEntitiesSamplesFolder, entity);
    if (isDirectory(samplePath)) {
      memFs.copy(`${samplePath}/**`, dest);
    } else if (extname(samplePath) === '.jdl') {
      memFs.copy(samplePath, join(dest, entity));
    } else if (!extname(samplePath)) {
      memFs.copy(`${samplePath}.jdl`, join(dest, `${entity}.jdl`));
    }
  }
}

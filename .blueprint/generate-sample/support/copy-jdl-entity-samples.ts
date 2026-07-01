/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

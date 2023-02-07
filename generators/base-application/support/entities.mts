/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { existsSync, mkdirSync, opendirSync } from 'fs';
import { extname, basename } from 'path';

// eslint-disable-next-line import/prefer-default-export
export function getEntitiesFromDir(configDir: string): string[] {
  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }
  const dir = opendirSync(configDir);
  const entityNames: string[] = [];
  let dirent = dir.readSync();
  while (dirent !== null) {
    const extension = extname(dirent.name);
    if (dirent.isFile() && extension === '.json') {
      entityNames.push(basename(dirent.name, extension));
    }
    dirent = dir.readSync();
  }
  dir.closeSync();
  return entityNames;
}

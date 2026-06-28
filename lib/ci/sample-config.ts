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

import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { GENERATOR_JHIPSTER } from '../../generators/generator-constants.ts';
import type { InfoFile } from '../../generators/info/support/extract-info.ts';
import type { YoRcContent } from '../types/command-all.ts';
import { mutateData } from '../utils/object.ts';

const isFile = async (filename: string): Promise<boolean> => {
  try {
    return (await lstat(filename)).isFile();
  } catch {
    return false;
  }
};

export const prepareSample = async (
  projectFolder: string,
  files: InfoFile[],
  { removeBlueprints }: { removeBlueprints?: boolean } = {},
): Promise<InfoFile[]> => {
  return Promise.all(
    files.map(async ({ filename, content, type }) => {
      filename = join(projectFolder, filename);
      if (filename.endsWith('.yo-rc.json')) {
        if (await isFile(filename)) {
          const { jwtSecretKey, rememberMeKey } = JSON.parse(await readFile(filename, 'utf-8'))[GENERATOR_JHIPSTER];
          if (jwtSecretKey || rememberMeKey) {
            const newContent: YoRcContent = JSON.parse(content);
            mutateData(newContent[GENERATOR_JHIPSTER], { jwtSecretKey, rememberMeKey });
            if (removeBlueprints) {
              delete newContent[GENERATOR_JHIPSTER].blueprints;
            }
            content = JSON.stringify(newContent, null, 2);
          }
        }
      }
      return { filename, content, type };
    }),
  );
};

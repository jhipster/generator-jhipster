import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { GENERATOR_JHIPSTER } from '../../generators/generator-constants.js';
import type { InfoFile } from '../../generators/info/support/extract-info.js';
import type { YoRcContent } from '../types/command-all.js';
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

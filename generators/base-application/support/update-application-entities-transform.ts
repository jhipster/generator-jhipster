import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { loadFile } from 'mem-fs';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';
import normalizePath from 'normalize-path';
import { transform } from 'p-transform';

import { GENERATOR_JHIPSTER } from '../../generator-constants.ts';

export const updateApplicationEntitiesTransform = ({
  destinationPath,
  throwOnMissingConfig = true,
}: {
  destinationPath: string;
  throwOnMissingConfig?: boolean;
}) => {
  let yoRcFileInMemory: MemFsEditorFile | undefined;
  const entities: string[] = [];
  const yoRcFilePath = join(destinationPath, '.yo-rc.json');
  const entitiesMatcher = new Minimatch(`${normalizePath(destinationPath)}/.jhipster/*.json`);

  return transform<MemFsEditorFile>(
    file => {
      if (file.path === yoRcFilePath) {
        yoRcFileInMemory = file;
        return undefined;
      }
      if (entitiesMatcher.match(normalizePath(file.path))) {
        entities.push(basename(file.path).replace('.json', ''));
      }
      return file;
    },
    async function () {
      try {
        entities.push(...(await readdir(join(destinationPath, '.jhipster'))).map(file => file.replace('.json', '')));
      } catch {
        // Directory does not exist
      }
      if (entities.length > 0) {
        // The mem-fs instance requires another file instance to emit a change event
        const yoRcFile = loadFile(yoRcFilePath) as MemFsEditorFile;
        // Prefer in-memory file if it exists
        const yoRcFileContents = yoRcFileInMemory?.contents ?? yoRcFile.contents;
        if (yoRcFileContents) {
          const contents = JSON.parse(yoRcFileContents.toString());
          if (contents[GENERATOR_JHIPSTER]) {
            contents[GENERATOR_JHIPSTER].entities = [...new Set([...(contents[GENERATOR_JHIPSTER].entities ?? []), ...entities])];
            yoRcFile.contents = Buffer.from(JSON.stringify(contents, null, 2));
            yoRcFileInMemory = yoRcFile;
          } else if (throwOnMissingConfig) {
            throw new Error(`File ${yoRcFile.path} is not a valid JHipster configuration file`);
          }
        } else if (throwOnMissingConfig) {
          throw new Error(`File ${yoRcFile.path} has no contents`);
        }
      }
      if (yoRcFileInMemory) {
        this.push(yoRcFileInMemory);
      }
    },
  );
};

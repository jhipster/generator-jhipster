import { extname } from 'node:path';

import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';

import type CoreGenerator from '../../base-core/index.js';
import { addLineNumbers } from '../internal/transform-utils.js';

export const createRemoveUnusedImportsTransform = function (
  this: CoreGenerator,
  options: {
    ignoreErrors?: boolean;
  } = {},
) {
  const { ignoreErrors } = options;

  const pool = new Piscina({
    maxThreads: 1,
    filename: new URL('./java-lint-worker.js', import.meta.url).href,
  });

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      if (extname(file.path) === '.java' && isFileStateModified(file)) {
        if (file.contents) {
          const fileContents = file.contents.toString('utf8');
          const { result, error } = await pool.run({
            fileContents,
            fileRelativePath: file.relative,
          });
          if (result) {
            file.contents = Buffer.from(result);
          }
          if (error) {
            const errorMessage = `Error parsing file ${file.relative}: ${error} at ${addLineNumbers(fileContents)}`;
            if (ignoreErrors) {
              this?.log?.warn?.(errorMessage);
              return;
            }

            throw new Error(errorMessage);
          }
        }
      }
    },
    async () => {
      await pool.destroy();
    },
  );
};

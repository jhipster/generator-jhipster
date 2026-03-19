import { extname } from 'node:path';

import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { passthrough } from 'p-transform';

import type CoreGenerator from '../../base-core/index.ts';
import { addLineNumbers } from '../internal/transform-utils.ts';

import javaLintWorker from './java-lint-worker.ts';

/**
 * Creates a mem-fs passthrough transform that removes unused import declarations from
 * every modified `.java` file in the virtual file system.
 *
 * @param options transform options
 * @param options.ignoreErrors when `true`, parse errors are logged as warnings instead of being thrown
 * @returns a passthrough stream transform that processes modified Java files
 */
export const createRemoveUnusedImportsTransform = async function (
  this: CoreGenerator,
  options: {
    ignoreErrors?: boolean;
  } = {},
) {
  const { ignoreErrors } = options;

  return passthrough(async (file: VinylMemFsEditorFile) => {
    if (extname(file.path) === '.java' && isFileStateModified(file) && file.contents) {
      const fileContents = file.contents.toString('utf8');
      const result = await javaLintWorker({ fileContents });
      if ('result' in result) {
        file.contents = Buffer.from(result.result);
      }
      if ('error' in result) {
        const errorMessage = `Error parsing file ${file.relative}: ${result.error} at ${addLineNumbers(fileContents)}`;
        if (ignoreErrors) {
          this?.log?.warn?.(errorMessage);
          return;
        }

        throw new Error(errorMessage);
      }
    }
  });
};

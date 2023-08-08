import { extname } from 'path';
import { passthrough } from '@yeoman/transform';
import { isFileStateDeleted } from 'mem-fs-editor/state';
import { removeUnusedImports } from 'java-lint';
import { VinylMemFsEditorFile } from 'mem-fs-editor';
import CoreGenerator from '../../base-core/index.mjs';

// eslint-disable-next-line import/prefer-default-export
export const createRemoveUnusedImportsTransform = function (
  this: CoreGenerator,
  options: {
    ignoreErrors?: boolean;
  } = {},
) {
  const { ignoreErrors } = options;
  return passthrough((file: VinylMemFsEditorFile) => {
    if (extname(file.path) === '.java' && !isFileStateDeleted(file)) {
      if (file.contents) {
        try {
          file.contents = Buffer.from(removeUnusedImports(file.contents.toString('utf8')));
        } catch (error: any) {
          const errorMessage = `Error parsing file ${file.relative}: ${error} at ${file.contents?.toString()}`;
          if (ignoreErrors) {
            this?.log?.warn?.(errorMessage);
            return;
          }

          throw new Error(errorMessage);
        }
      }
    }
  });
};

import { extname } from 'node:path';

import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';

import { isDistFolder } from '../../../lib/index.ts';
import type CoreGenerator from '../../base-core/index.ts';
import { addLineNumbers } from '../internal/transform-utils.js';

import type javaLintWorker from './java-lint-worker.ts';

const supportsTsFiles = parseInt(process.versions.node.split('.')[0]) >= 22;
const useTsFile = !isDistFolder();

export const createRemoveUnusedImportsTransform = async function (
  this: CoreGenerator,
  options: {
    ignoreErrors?: boolean;
  } = {},
) {
  const { ignoreErrors } = options;

  let pool: Piscina | undefined;
  let apply: typeof javaLintWorker;
  if (useTsFile && !supportsTsFiles) {
    const { default: javaLintWorkerImport } = await import('./java-lint-worker.ts');
    apply = javaLintWorkerImport;
  } else {
    pool = new Piscina<Parameters<typeof javaLintWorker>[0], ReturnType<typeof javaLintWorker>>({
      maxThreads: 1,
      filename: new URL(`./java-lint-worker.${useTsFile ? 'ts' : 'js'}`, import.meta.url).href,
    });
    apply = data => pool!.run(data);
  }

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      if (extname(file.path) === '.java' && isFileStateModified(file)) {
        if (file.contents) {
          const fileContents = file.contents.toString('utf8');
          const result = await apply({ fileContents });
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
      }
    },
    async () => {
      await pool?.destroy();
    },
  );
};

/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { passthrough } from 'p-transform';
import { isFileStateModified } from 'mem-fs-editor/state';
import { Minimatch } from 'minimatch';
import { Piscina } from 'piscina';
import type { Options as PrettierOptions } from 'prettier';
import type { MemFsEditorFile, VinylMemFsEditorFile } from 'mem-fs-editor';
import type CoreGenerator from '../../base-core/index.js';

const minimatch = new Minimatch('**/{.prettierrc**,.prettierignore}');
export const isPrettierConfigFilePath = (filePath: string) => minimatch.match(filePath);
export const isPrettierConfigFile = (file: MemFsEditorFile) => isPrettierConfigFilePath(file.path);

type PrettierWorkerOptions = {
  prettierPackageJson?: boolean;
  prettierJava?: boolean;
  prettierProperties?: boolean;
  prettierOptions?: PrettierOptions;
};

export class PrettierPool extends Piscina {
  constructor(options = {}) {
    super({
      maxThreads: 1,
      filename: new URL('./prettier-worker.js', import.meta.url).href,
      ...options,
    });
  }

  apply(
    data: PrettierWorkerOptions & { relativeFilePath: string; filePath: string; fileContents: string },
  ): Promise<{ result?: string; errorMessage?: string }> {
    return this.run(data);
  }
}

export const createPrettierTransform = async function (
  this: CoreGenerator<any, any, any, any, any, any, any, any>,
  options: PrettierWorkerOptions & { ignoreErrors?: boolean; extensions?: string; skipForks?: boolean } = {},
) {
  const { ignoreErrors = false, extensions = '*', skipForks, ...workerOptions } = options;
  const globExpression = extensions.includes(',') ? `**/*.{${extensions}}` : `**/*.${extensions}`;
  const minimatch = new Minimatch(globExpression, { dot: true });

  let applyPrettier;
  const pool = skipForks ? undefined : new PrettierPool();
  if (skipForks) {
    const { default: applyPrettierWorker } = await import('./prettier-worker.js');
    applyPrettier = applyPrettierWorker;
  } else {
    applyPrettier = data => pool!.apply(data);
  }

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      if (!minimatch.match(file.path) || !isFileStateModified(file)) {
        return;
      }
      if (!file.contents) {
        throw new Error(`File content doesn't exist for ${file.relative}`);
      }
      const { result, errorMessage } = await applyPrettier({
        relativeFilePath: file.relative,
        filePath: file.path,
        fileContents: file.contents.toString('utf8'),
        ...workerOptions,
      });
      if (result) {
        file.contents = Buffer.from(result);
      }
      if (errorMessage) {
        if (!ignoreErrors) {
          throw new Error(errorMessage);
        }
        this?.log?.warn?.(errorMessage);
      }
    },
    async () => {
      await pool?.destroy();
    },
  );
};

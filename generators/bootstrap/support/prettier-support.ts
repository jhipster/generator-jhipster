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
import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { Minimatch } from 'minimatch';
import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';

import { isDistFolder } from '../../../lib/index.ts';
import type CoreGenerator from '../../base-core/index.ts';

import type prettierWorker from './prettier-worker.ts';

const minimatch = new Minimatch('**/{.prettierrc**,.prettierignore}');
export const isPrettierConfigFilePath = (filePath: string) => minimatch.match(filePath);

const supportsTsFiles = parseInt(process.versions.node.split('.')[0]) >= 22;
const useTsFile = !isDistFolder();

export const createPrettierTransform = async function (
  this: CoreGenerator,
  options: Omit<Parameters<typeof prettierWorker>[0], 'relativeFilePath' | 'filePath' | 'fileContents'> & {
    ignoreErrors?: boolean;
    extensions?: string;
    skipForks?: boolean;
  } = {},
) {
  const { ignoreErrors = false, extensions = '*', skipForks, ...workerOptions } = options;
  const globExpression = extensions.includes(',') ? `**/*.{${extensions}}` : `**/*.${extensions}`;
  const minimatch = new Minimatch(globExpression, { dot: true });

  let applyPrettier: typeof prettierWorker;
  let pool: Piscina | undefined;
  if (skipForks || (useTsFile && !supportsTsFiles)) {
    const { default: applyPrettierWorker } = await import('./prettier-worker.ts');
    applyPrettier = applyPrettierWorker;
  } else {
    pool = new Piscina<Parameters<typeof prettierWorker>[0], Awaited<ReturnType<typeof prettierWorker>>>({
      maxThreads: 1,
      filename: new URL(`./prettier-worker.${useTsFile ? 'ts' : 'js'}`, import.meta.url).href,
      ...options,
    });
    applyPrettier = pool!.run.bind(pool!);
  }

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      if (!minimatch.match(file.path) || !isFileStateModified(file)) {
        return;
      }
      if (!file.contents) {
        throw new Error(`File content doesn't exist for ${file.relative}`);
      }
      const result = await applyPrettier({
        relativeFilePath: file.relative,
        filePath: file.path,
        fileContents: file.contents.toString('utf8'),
        ...workerOptions,
      });
      if ('result' in result) {
        file.contents = Buffer.from(result.result);
      }
      if ('errorMessage' in result) {
        if (!ignoreErrors) {
          throw new Error(result.errorMessage);
        }
        this?.log?.warn?.(result.errorMessage);
      }
    },
    async () => {
      await pool?.destroy();
    },
  );
};

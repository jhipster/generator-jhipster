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
import { isFileStateModified } from 'mem-fs-editor/state';
import { Minimatch } from 'minimatch';
import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';

import { isDistFolder } from '../../../lib/index.ts';
import type BaseGenerator from '../../base-core/index.ts';
import { addLineNumbers } from '../internal/transform-utils.ts';

import type eslintWorker from './eslint-worker.ts';

type PoolOptions = Exclude<ConstructorParameters<typeof Piscina>[0], undefined>;

const useTsFile = !isDistFolder();

export const createESLintTransform = async function (
  this: BaseGenerator | void,
  transformOptions: { ignoreErrors?: boolean; poolOptions?: PoolOptions } & Partial<Parameters<typeof eslintWorker>[0]> = {},
) {
  const { extensions = 'js,cjs,mjs,ts,cts,mts,jsx,tsx', ignoreErrors, cwd, poolOptions, recreateEslint } = transformOptions;
  const minimatch = new Minimatch(`**/*.{${extensions}}`, { dot: true });

  const pool = new Piscina<Parameters<typeof eslintWorker>[0], Awaited<ReturnType<typeof eslintWorker>>>({
    maxThreads: 2,
    idleTimeout: 100,
    filename: new URL(`./eslint-worker.${useTsFile ? 'ts' : 'js'}`, import.meta.url).href,
    ...poolOptions,
  });

  return passthrough(
    async file => {
      if (!minimatch.match(file.path) || !isFileStateModified(file)) {
        return;
      }
      const fileContents = file.contents.toString();
      const result = await pool.run({
        cwd,
        filePath: file.path,
        fileContents,
        extensions,
        recreateEslint,
      } satisfies Parameters<typeof eslintWorker>[0]);
      if ('result' in result) {
        file.contents = Buffer.from(result.result);
      }
      if ('error' in result) {
        const errorMessage = `Error parsing file ${file.relative}: ${result.error} at ${addLineNumbers(fileContents)}`;
        if (!ignoreErrors) {
          throw new Error(errorMessage);
        }

        this?.log?.warn?.(errorMessage);
      }
    },
    async () => {
      await pool.destroy();
    },
  );
};

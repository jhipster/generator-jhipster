/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import type BaseGenerator from '../../base-core/index.js';
import { addLineNumbers } from '../internal/transform-utils.js';

type PoolOptions = Exclude<ConstructorParameters<typeof Piscina>[0], undefined>;
type ESLintWorkerOptions = { cwd?: string; extensions: string; recreateEslint?: boolean };

export class ESLintPool extends Piscina {
  constructor(options?: PoolOptions) {
    super({
      maxThreads: 1,
      filename: new URL('./eslint-worker.js', import.meta.url).href,
      ...options,
    });
  }

  apply(data: ESLintWorkerOptions & { filePath: string; fileContents: string }): Promise<{ result: string; error: string }> {
    return this.run(data);
  }
}

export const createESLintTransform = function (
  this: BaseGenerator | void,
  transformOptions: { ignoreErrors?: boolean; poolOptions?: PoolOptions } & Partial<ESLintWorkerOptions> = {},
) {
  const { extensions = 'js,cjs,mjs,ts,cts,mts,jsx,tsx', ignoreErrors, cwd, poolOptions, recreateEslint } = transformOptions;
  const minimatch = new Minimatch(`**/*.{${extensions}}`, { dot: true });

  const pool = new ESLintPool(poolOptions);

  return passthrough(
    async file => {
      if (!minimatch.match(file.path) || !isFileStateModified(file)) {
        return;
      }
      const fileContents = file.contents.toString();
      const { result, error } = await pool.apply({
        cwd,
        filePath: file.path,
        fileContents,
        extensions,
        recreateEslint,
      });
      if (result) {
        file.contents = Buffer.from(result);
      }
      if (error) {
        const errorMessage = `Error parsing file ${file.relative}: ${error} at ${addLineNumbers(fileContents)}`;
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

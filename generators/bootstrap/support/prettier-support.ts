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
import Piscina from 'piscina';
import type prettier from 'prettier';
import type { MemFsEditorFile, VinylMemFsEditorFile } from 'mem-fs-editor';
import type CoreGenerator from '../../base-core/index.js';

const minimatch = new Minimatch('**/{.prettierrc**,.prettierignore}');
export const isPrettierConfigFilePath = (filePath: string) => minimatch.match(filePath);
export const isPrettierConfigFile = (file: MemFsEditorFile) => isPrettierConfigFilePath(file.path);

export const createPrettierTransform = async function (
  this: CoreGenerator,
  options: {
    ignoreErrors?: boolean;
    extensions?: string;
    prettierPackageJson?: boolean;
    prettierJava?: boolean;
    prettierProperties?: boolean;
    prettierOptions?: prettier.Options;
  } = {},
) {
  const pool = new Piscina({
    maxThreads: 1,
    filename: new URL('./prettier-worker.js', import.meta.url).href,
  });

  const { ignoreErrors = false, extensions = '*', prettierPackageJson, prettierJava, prettierProperties, prettierOptions } = options;
  const globExpression = extensions.includes(',') ? `**/*.{${extensions}}` : `**/*.${extensions}`;
  const minimatch = new Minimatch(globExpression, { dot: true });

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      if (!minimatch.match(file.path) || !isFileStateModified(file)) {
        return;
      }
      if (!file.contents) {
        throw new Error(`File content doesn't exist for ${file.relative}`);
      }
      const { result, errorMessage } = await pool.run({
        relativeFilePath: file.relative,
        filePath: file.path,
        fileContents: file.contents.toString('utf8'),
        prettierOptions,
        prettierPackageJson,
        prettierJava,
        prettierProperties,
        ignoreErrors,
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
    () => {
      pool.destroy();
    },
  );
};

/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import prettier from 'prettier';
import prettierPluginJava from 'prettier-plugin-java';
import prettierPluginProperties from 'prettier-plugin-properties';
import prettierPluginPackagejson from 'prettier-plugin-packagejson';
import { Minimatch } from 'minimatch';
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
  // prettier cache is global, generators may execute more than one commit.
  // In case prettier config is committed to disk at later commits, the cache may be outdated.
  await prettier.clearConfigCache();

  const { ignoreErrors = false, extensions = '*', prettierPackageJson, prettierJava, prettierProperties, prettierOptions } = options;
  const globExpression = extensions.includes(',') ? `**/*.{${extensions}}` : `**/*.${extensions}`;
  const minimatch = new Minimatch(globExpression, { dot: true });

  return passthrough(async (file: VinylMemFsEditorFile) => {
    if (!minimatch.match(file.path) || !isFileStateModified(file)) {
      return;
    }
    if (!file.contents) {
      throw new Error(`File content doesn't exist for ${file.relative}`);
    }
    /* resolve from the projects config */
    let fileContent;
    try {
      const resolvedDestinationFileOptions = await prettier.resolveConfig(file.relative);
      const fileOptions: prettier.Options = {
        // Config from disk
        ...resolvedDestinationFileOptions,
        plugins: [],
        // for better errors
        filepath: file.relative,
        ...prettierOptions,
      };
      if (prettierPackageJson && file.path.endsWith('package.json')) {
        fileOptions.plugins!.push(prettierPluginPackagejson);
      }
      if (prettierJava && file.path.endsWith('.java')) {
        fileOptions.plugins!.push(prettierPluginJava);
      }
      if (prettierProperties) {
        fileOptions.plugins!.push(prettierPluginProperties);
      }
      fileContent = file.contents.toString('utf8');
      const data = await prettier.format(fileContent, fileOptions);
      file.contents = Buffer.from(data);
    } catch (error) {
      let errorMessage;
      if (fileContent) {
        errorMessage = `Error parsing file ${file.relative}: ${error}

At: ${fileContent
          .split('\n')
          .map((value, idx) => `${idx + 1}: ${value}`)
          .join('\n')}`;
      } else {
        errorMessage = `Unknown prettier error: ${error}`;
      }
      if (ignoreErrors) {
        this?.log?.warn?.(errorMessage);
        return;
      }
      throw new Error(errorMessage);
    }
  });
};

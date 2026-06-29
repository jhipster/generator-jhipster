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

import { type Options, format, resolveConfig } from 'prettier';
import prettierPluginJava from 'prettier-plugin-java';
import prettierPluginPackagejson from 'prettier-plugin-packagejson';
// @ts-ignore No types available
import prettierPluginProperties from 'prettier-plugin-properties';

import { addLineNumbers } from '../internal/transform-utils.ts';

export default async ({
  relativeFilePath,
  filePath,
  fileContents,
  prettierOptions,
  prettierPackageJson,
  prettierJava,
  prettierProperties,
}: {
  relativeFilePath: string;
  filePath: string;
  fileContents: string;
  prettierOptions?: Record<string, unknown>;
  prettierPackageJson?: boolean;
  prettierJava?: boolean;
  prettierProperties?: boolean;
}): Promise<{ result: string } | { errorMessage: string }> => {
  try {
    const resolvedDestinationFileOptions = await resolveConfig(relativeFilePath);
    const fileOptions: Options = {
      // Config from disk
      ...resolvedDestinationFileOptions,
      plugins: [],
      // for better errors
      filepath: relativeFilePath,
      ...prettierOptions,
    };
    if (prettierPackageJson && filePath.endsWith('package.json')) {
      fileOptions.plugins!.push(prettierPluginPackagejson);
    }
    if (prettierJava && filePath.endsWith('.java')) {
      fileOptions.plugins!.push(prettierPluginJava);
    }
    if (prettierProperties) {
      fileOptions.plugins!.push(prettierPluginProperties);
    }
    return { result: await format(fileContents, fileOptions) };
  } catch (error) {
    let errorMessage: string;
    if (fileContents) {
      errorMessage = `Error parsing file ${relativeFilePath}: ${error}

At: ${addLineNumbers(fileContents)}`;
    } else {
      errorMessage = `Unknown prettier error: ${error}`;
    }
    return { errorMessage };
  }
};

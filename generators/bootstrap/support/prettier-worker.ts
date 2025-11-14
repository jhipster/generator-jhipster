import { type Options, format, resolveConfig } from 'prettier';
import prettierPluginJava from 'prettier-plugin-java';
// @ts-ignore No types available
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

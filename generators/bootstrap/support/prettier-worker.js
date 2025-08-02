import { format, resolveConfig } from 'prettier';
import prettierPluginJava from 'prettier-plugin-java';
import prettierPluginPackagejson from 'prettier-plugin-packagejson';
import prettierPluginProperties from 'prettier-plugin-properties';

import { addLineNumbers } from '../internal/transform-utils.js';

export default async ({
  relativeFilePath,
  filePath,
  fileContents,
  prettierOptions,
  prettierPackageJson,
  prettierJava,
  prettierProperties,
}) => {
  try {
    const resolvedDestinationFileOptions = await resolveConfig(relativeFilePath);
    const fileOptions = {
      // Config from disk
      ...resolvedDestinationFileOptions,
      plugins: [],
      // for better errors
      filepath: relativeFilePath,
      ...prettierOptions,
    };
    if (prettierPackageJson && filePath.endsWith('package.json')) {
      fileOptions.plugins.push(prettierPluginPackagejson);
    }
    if (prettierJava && filePath.endsWith('.java')) {
      fileOptions.plugins.push(prettierPluginJava);
    }
    if (prettierProperties) {
      fileOptions.plugins.push(prettierPluginProperties);
    }
    return { result: await format(fileContents, fileOptions) };
  } catch (error) {
    let errorMessage;
    if (fileContents) {
      errorMessage = `Error parsing file ${relativeFilePath}: ${error}

At: ${addLineNumbers(fileContents)}`;
    } else {
      errorMessage = `Unknown prettier error: ${error}`;
    }
    return { errorMessage };
  }
};

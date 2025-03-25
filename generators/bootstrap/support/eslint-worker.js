import eslint from 'eslint';
import ts from 'typescript-eslint';

import jhipster from '../../../lib/eslint/index.js';

let eslintInstance;

export default async ({ cwd, filePath, fileContents, extensions, config, additionalConfig = [], recreateEslint }) => {
  if (recreateEslint || !eslintInstance) {
    eslintInstance = new eslint.ESLint({
      fix: true,
      overrideConfigFile: true,
      cache: false,
      cwd,
      baseConfig: ts.config(
        { files: [`**/*.{${extensions}}`] },
        ts.configs.base,
        ...additionalConfig,
        config ? JSON.parse(config) : jhipster.base,
        {
          linterOptions: {
            reportUnusedDisableDirectives: 'off',
          },
        },
      ),
    });
  }

  if (await eslintInstance.isPathIgnored(filePath)) {
    return { result: fileContents };
  }
  try {
    const [result] = await eslintInstance.lintText(fileContents, { filePath });
    return { result: result.output ?? fileContents };
  } catch (error) {
    return { error: `${error}` };
  }
};

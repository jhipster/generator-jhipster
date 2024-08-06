import eslint from 'eslint';
import ts from 'typescript-eslint';

import jhipster from '../../../lib/eslint/index.js';

let eslintInstance;

export default async ({ cwd, filePath, fileContents, extensions }) => {
  if (!eslintInstance) {
    eslintInstance = new eslint.ESLint({
      fix: true,
      overrideConfigFile: true,
      allowInlineConfig: false,
      cache: false,
      cwd,
      baseConfig: ts.config({ files: [`**/*.{${extensions}}`] }, ts.configs.base, jhipster.base),
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

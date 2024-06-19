import eslint from 'eslint';

import { baseRules } from '../../../lib/eslint/base.js';

let eslintInstance;

/* Flat config based eslint
Blocked by https://github.com/import-js/eslint-plugin-import/issues/2556
import eslint from 'eslint/use-at-your-own-risk';
const { languageOptions, plugins: tseslintPlugins } = tseslint.configs.base;
new eslint.FlatESLint({ fix: true, overrideConfigFile: true, cwd, plugins, baseConfig: { languageOptions, rules } });
*/

export default async ({ resolvePluginsRelativeTo, filePath, fileContents }) => {
  if (!eslintInstance) {
    eslintInstance = new eslint.ESLint({
      fix: true,
      // Disable destination configs. We should apply plugins and rules which jhipster depends on.
      useEslintrc: false,
      resolvePluginsRelativeTo,
      overrideConfig: {
        plugins: ['unused-imports', 'import'],
        extends: ['plugin:@typescript-eslint/base'],
        parserOptions: {
          sourceType: 'module',
          ecmaVersion: 'latest',
        },
        rules: baseRules,
      },
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

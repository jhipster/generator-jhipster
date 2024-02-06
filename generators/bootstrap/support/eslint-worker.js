import ESLint from 'eslint';

let eslint;

export default async ({ resolvePluginsRelativeTo, filePath, fileContents }) => {
  if (!eslint) {
    eslint = new ESLint.ESLint({
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
        rules: {
          'import/order': 'error',
          'import/no-duplicates': 'error',
          'unused-imports/no-unused-imports': 'error',
          'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
        },
      },
    });
  }

  if (await eslint.isPathIgnored(filePath)) {
    return { result: fileContents };
  }
  try {
    const [result] = await eslint.lintText(fileContents, { filePath });
    return { result: result.output ?? fileContents };
  } catch (error) {
    return { error: `${error}` };
  }
};

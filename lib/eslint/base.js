import imports from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';

/**
 * @type {import('typescript-eslint').ConfigWithExtends}
 *
 * Config applied to transformed source in generation process.
 * Rules must be compatible with auto fix to be applied.
 */
const baseConfig = {
  plugins: {
    'unused-imports': unusedImports,
    ...imports.flatConfigs.recommended.plugins,
  },
  rules: {
    'dot-notation': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-else-return': 'error',
    'no-regex-spaces': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': ['error', { array: false }],
    'prefer-object-has-own': 'error',
    'prefer-object-spread': 'error',
    'prefer-template': 'error',

    // Configure unused-imports rule
    'no-unused-vars': 'off',
    'import-x/no-duplicates': 'error',
    'import-x/no-useless-path-segments': 'error',
    'import-x/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        distinctGroup: false,
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        named: true,
        'newlines-between': 'always',
        pathGroups: [{ pattern: '{esmocha,vitest,jest}', group: 'builtin', position: 'before' }],
        pathGroupsExcludedImportTypes: [],
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_[^_]',
        args: 'after-used',
        argsIgnorePattern: '^_[^_]',
      },
    ],
  },
};

export default baseConfig;

import globals from 'globals';
import ts from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import chai from 'eslint-plugin-chai-friendly';
import jhipster from './lib/eslint/recommended.js';

export default ts.config(
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  { ignores: ['dist'] },
  jhipster,
  {
    files: ['**/*.ts'],
    extends: [...ts.configs.stylistic],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.spec.json'],
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', 'testing/**/*', 'test/**/*'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    rules: {
      'default-param-last': 'off',
      'prefer-regex-literals': 'off',
      'linebreak-style': 0,
      'eol-last': 2,
      quotes: [2, 'single', { avoidEscape: true }],
      semi: [2, 'always'],
      eqeqeq: [2, 'smart'],
      'no-restricted-globals': ['off'],
      'no-restricted-exports': 'off',
      'no-use-before-define': [2, 'nofunc'],
      'no-confusing-arrow': 'off',
      'no-multi-str': 2,
      'no-promise-executor-return': 'off',
      'no-irregular-whitespace': 2,
      'comma-dangle': 'off',
      'max-len': 'off',
      'func-names': 'off',
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',
      'no-plusplus': 'off',
      'no-unused-expressions': 0,
      'prefer-destructuring': 'off',
      'no-multi-assign': 'off',
      'no-param-reassign': 'off',
      'lines-between-class-members': [2, 'always', { exceptAfterSingleLine: true }],
      'no-await-in-loop': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
      ],
      'no-shadow': 'off',
      'import/extensions': [0, { pattern: { '{c,m,}{js,ts}': 'always' } }],
      'import/prefer-default-export': 'off',
    },
  },
  {
    ...chai.configs.recommendedFlat,
    files: ['jdl/**/*.spec.{js,ts}'],
  },
  prettier,
);

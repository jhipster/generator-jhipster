import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import chai from 'eslint-plugin-chai-friendly';
import imports from 'eslint-plugin-import-x';
import jhipster from './lib/eslint/index.js';

export default ts.config(
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  { ignores: ['dist'] },
  js.configs.recommended,
  jhipster.base,
  {
    files: ['**/*.ts'],
    extends: [...ts.configs.recommended, ...ts.configs.stylistic],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.spec.json', './tsconfig.eslint.json'],
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['**/*.spec.{js,ts}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    extends: [imports.flatConfigs.recommended, imports.flatConfigs.typescript],
    languageOptions: {
      // import plugin does not use ecmaVersion and sourceType from languageOptions object
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import-x/no-named-as-default-member': 'off',
      'import-x/namespace': 'off',
    },
  },
  {
    files: ['bin/**/*', '**/*.spec.ts', 'testing/**/*', 'test/**/*'],
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
  {
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-use-before-define': ['error', 'nofunc'],
      'no-multi-str': 'error',
      'no-irregular-whitespace': 'error',
      'no-console': 'error',
      'no-template-curly-in-string': 'error',
      'no-nested-ternary': 'error',
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
    },
  },
  {
    ...chai.configs.recommendedFlat,
    files: ['jdl/**/*.spec.{js,ts}'],
  },
  prettier,
);

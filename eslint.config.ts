import js from '@eslint/js';
import { type Config, defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
// @ts-ignore: missing types
import chai from 'eslint-plugin-chai-friendly';
import imports from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

import jhipster from './lib/eslint/index.ts';

export default defineConfig(
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
    plugins: { n },
    rules: {
      'n/prefer-node-protocol': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    ...ts.configs.recommended[0],
    ...ts.configs.stylistic[0],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: ['./tsconfig.spec.json'],
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-undef': 'off',
    },
  },
  {
    ...(imports.flatConfigs.recommended as Config),
    ...(imports.flatConfigs.typescript as Config),
    languageOptions: {
      // import plugin does not use ecmaVersion and sourceType from languageOptions object
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      'import-x/extensions': ['error', 'ignorePackages', { checkTypeImports: true, fix: true }],
      'import-x/namespace': 'off',
      'import-x/no-named-as-default-member': 'off',
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
    ...(chai.configs.recommendedFlat as Config),
    files: ['jdl/**/*.spec.{js,ts}'],
  },
  prettier,
);

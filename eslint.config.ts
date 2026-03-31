import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { type Config, defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import ejs from 'eslint-plugin-ejs-templates';
import imports from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

import { jsRules } from './lib/eslint/base.ts';
import jhipster from './lib/eslint/index.ts';

const tsFiles = ['**/*.{ts,mts,cts}'];
const jsFiles = ['**/*.{js,cjs,mjs}'];
const jsTsFiles = [...jsFiles, ...tsFiles];

export default defineConfig(
  {
    files: jsTsFiles,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  { ignores: ['dist', 'docs'] },
  {
    files: jsTsFiles,
    ...jhipster.base,
  },
  {
    files: jsTsFiles,
    plugins: { n },
    rules: {
      'n/prefer-node-protocol': 'error',
    },
  },
  {
    files: tsFiles,
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
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-conversion': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-redeclare': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: jsTsFiles,
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
    files: jsTsFiles,
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
  prettier,
  ejs.configs.base,
  {
    files: ['**/*.ejs'],
    plugins: {
      '@stylistic': stylistic,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'ejs-templates/prefer-raw': 'error',
      'ejs-templates/prefer-slurping-codeonly': 'error',
      'ejs-templates/experimental-prefer-slurp-multiline': 'error',
      'ejs-templates/prefer-single-line-tags': ['error', { mode: 'braces' }],
      'ejs-templates/slurp-newline': 'error',

      'prettier/prettier': 'off',
      ...js.configs.recommended.rules,
      ...jsRules,
      'prefer-destructuring': ['error', { array: false, object: true }],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/comma-spacing': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
      '@stylistic/semi': 'error',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/template-curly-spacing': 'error',

      'ejs-templates/indent': 'error',
      'ejs-templates/format': 'error',
    },
  },
);

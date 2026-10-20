import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import ejs from 'eslint-plugin-ejs-templates';
import imports from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

import { jsRules } from './lib/eslint/base.ts';
import jhipster, { plugin as jhipsterPlugin } from './lib/eslint/index.ts';

const tsFiles = ['**/*.{ts,mts,cts}'];
const jsFiles = ['**/*.{js,cjs,mjs}'];
const jsTsFiles = [...jsFiles, ...tsFiles];

export default defineConfig(
  {
    files: jsTsFiles,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
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
    files: ['generators/**/generator.ts'],
    ignores: [
      // The base classes define the priority API itself: each `as<Priority>TaskGroup` helper is deliberately
      // paired with the priority it types, so their members are not in running order and are not meant to be.
      // Their plain priority getters are the defaults subclasses override, so they are not registered there either.
      'generators/base/generator.ts',
      'generators/base-*/generator.ts',
    ],
    plugins: { jhipster: jhipsterPlugin },
    rules: {
      'jhipster/no-unregistered-task-group': 'error',
      'jhipster/task-group-order': 'error',
    },
  },
  {
    files: tsFiles,
    extends: [ts.configs.recommended, ts.configs.stylistic],
    languageOptions: {
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
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: true }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash-es',
              message: "Import the module of the function, like 'lodash-es/camelCase.js': the index imports every module of lodash-es.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: jsTsFiles,
    extends: [imports.flatConfigs.recommended, imports.flatConfigs.typescript],
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
      'logical-assignment-operators': 'error',
      'no-use-before-define': ['error', 'nofunc'],
      'no-multi-str': 'error',
      'no-console': 'error',
      'no-template-curly-in-string': 'error',
      'no-useless-concat': 'error',
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
  ejs.configs.customize(
    {
      html: 'never',
      prettierBlocklist: true,
      stylisticBlocklist: true,
      experimental: true,
      allowedGlobals: ['wrapMono', 'relativeDir'],
    },
    js.configs.recommended,
    stylistic.configs.customize({
      jsx: false,
      semi: true,
    }),
    {
      rules: {
        ...jsRules,
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-useless-concat': 'error',
        '@stylistic/no-extra-parens': ['error', 'all', { nestedBinaryExpressions: false, ternaryOperandBinaryExpressions: false }],
        '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/no-mixed-operators': 'off',
      },
    },
  ),
);

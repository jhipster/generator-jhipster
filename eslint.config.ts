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
    extends: [ts.configs.recommended, ts.configs.stylistic],
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
      '@typescript-eslint/no-import-type-side-effects': 'error',
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
      'logical-assignment-operators': 'error',
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
  ejs.configs.customize(
    {
      html: 'never',
      prettierBlocklist: true,
      stylisticBlocklist: true,
      experimental: true,
      allowedGlobals: ['wrapMono', 'generateEntityClientEnumImports', 'getOriginalField', 'generateFakeData', 'parseInt'],
    },
    stylistic.configs.customize({
      jsx: false,
      semi: true,
    }),
    {
      rules: {
        ...js.configs.recommended.rules,
        ...jsRules,
        'no-negated-condition': 'error',
        'no-extra-parens': ['error', 'all', { nestedBinaryExpressions: false, ternaryOperandBinaryExpressions: false }],
        'prefer-destructuring': ['error', { array: false, object: true }],
        '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/no-mixed-operators': 'off',
      },
    },
  ),
);

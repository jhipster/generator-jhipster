/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Config } from 'eslint/config';
import imports from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';

export const jsRules: Record<string, string | [string, ...any[]]> = {
  'dot-notation': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-else-return': 'error',
  'no-regex-spaces': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'object-shorthand': 'error',
  'prefer-const': 'error',
  'prefer-destructuring': ['error', { array: false, object: true }],
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-template': 'error',
};

/**
 * Config applied to transformed source in generation process.
 * Rules must be compatible with auto fix to be applied.
 */
const baseConfig: Config = {
  plugins: {
    'unused-imports': unusedImports,
    ...imports.flatConfigs.recommended.plugins,
  },
  rules: {
    ...jsRules,

    // Configure unused-imports rule
    'no-unused-vars': 'off',
    'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
    'import-x/no-useless-path-segments': 'error',
    'import-x/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        distinctGroup: false,
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        named: true,
        'newlines-between': 'always',
        pathGroups: [
          { pattern: '{esmocha,vitest,jest}', group: 'builtin', position: 'before' },
          { pattern: '{react,react-bootstrap,react-jhipster,react-router,vue,vue-i18n,vue-router}', group: 'builtin', position: 'after' },
          { pattern: '@angular/**', group: 'builtin', position: 'after' },
          { pattern: '{app,@}/**', group: 'parent', position: 'before' },
        ],
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
} as const satisfies Config;

export default baseConfig;

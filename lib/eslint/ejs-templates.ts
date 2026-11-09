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

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import type { Config } from 'eslint/config';
import ejs from 'eslint-plugin-ejs-templates';

import { jsRules } from './base.ts';

export { jsRules };

export type EjsTemplatesConfigOptions = Parameters<typeof ejs.configs.customize>[0] & {
  /** Rules added to the ones of JHipster, overriding them. */
  rules?: NonNullable<Config['rules']>;
};

/**
 * Config of the EJS templates, the one generator-jhipster lints its own templates with, for blueprints to lint theirs.
 * Takes the options of the customize config of eslint-plugin-ejs-templates, with the defaults of JHipster, and rules.
 * Needs the optional peer dependencies eslint-plugin-ejs-templates and @stylistic/eslint-plugin.
 */
export const ejsTemplates = ({ rules, ...options }: EjsTemplatesConfigOptions = {}): Config[] =>
  ejs.configs.customize(
    {
      html: 'never',
      prettierBlocklist: true,
      stylisticBlocklist: true,
      experimental: true,
      ...options,
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
        ...rules,
      },
    },
  );

export default ejsTemplates;

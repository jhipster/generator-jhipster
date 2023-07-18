/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { passthrough } from 'p-transform';
import { isFileStateDeleted } from 'mem-fs-editor/state';
import ESLint from 'eslint';
import { Minimatch } from 'minimatch';

import BaseGenerator from '../../base-core/index.mjs';
import { getPackageRoot } from '../../../lib/index.mjs';

// eslint-disable-next-line import/prefer-default-export
export const createESLintTransform = function (
  this: BaseGenerator | void,
  transformOptions: { ignoreErrors?: boolean; extensions?: string } = {},
) {
  const { extensions = 'js,ts', ignoreErrors } = transformOptions;
  const minimatch = new Minimatch(`**/*.{${extensions}}`, { dot: true });
  const eslint = new ESLint.ESLint({
    fix: true,
    // Disable destination configs. We should apply plugins and rules which jhipster depends on.
    useEslintrc: false,
    resolvePluginsRelativeTo: getPackageRoot(),
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

  return passthrough(async file => {
    if (!minimatch.match(file.path) || isFileStateDeleted(file)) {
      return;
    }
    if (!file.contents) {
      throw new Error(`File content doesn't exist for ${file.relative}`);
    }
    try {
      if (await eslint.isPathIgnored(file.path)) {
        return;
      }
      const [result] = await eslint.lintText(file.contents.toString(), { filePath: file.path });
      if (result.output) {
        file.contents = Buffer.from(result.output);
      }
    } catch (error) {
      if (ignoreErrors) {
        this?.log?.warn?.(error);
        return;
      }

      throw error;
    }
  });
};

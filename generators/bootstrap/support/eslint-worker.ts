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

import eslint from 'eslint';
import { defineConfig } from 'eslint/config';
import java from 'eslint-plugin-java-lang';
import ts from 'typescript-eslint';

import jhipster from '../../../lib/eslint/index.ts';

let eslintInstance: eslint.ESLint;

export default async ({
  cwd,
  filePath,
  fileContents,
  extensions,
  config,
  additionalConfig = [],
  recreateEslint,
}: {
  cwd?: string;
  filePath: string;
  fileContents: string;
  extensions: string;
  config?: string | null;
  additionalConfig?: eslint.Linter.Config[];
  recreateEslint?: boolean;
}): Promise<{ result: string } | { error: string }> => {
  if (recreateEslint || !eslintInstance) {
    eslintInstance = new eslint.ESLint({
      fix: true,
      overrideConfigFile: true,
      cache: false,
      cwd,
      baseConfig: defineConfig(
        { files: [`**/*.{${extensions}}`] },
        ts.configs.base,
        ...additionalConfig,
        config ? JSON.parse(config) : jhipster.base,
        {
          linterOptions: {
            reportUnusedDisableDirectives: 'off',
          },
        },
        extensions.split(',').includes('java') ? java.configs.recommended : {},
      ),
    });
  }

  if (await eslintInstance.isPathIgnored(filePath)) {
    return { result: fileContents };
  }
  try {
    const [result] = await eslintInstance.lintText(fileContents, { filePath });
    return { result: result.output ?? fileContents };
  } catch (error) {
    return { error: `${error}` };
  }
};

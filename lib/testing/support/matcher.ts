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

import { runResult } from '../helpers.ts';

/**
 * Requires a global `it` function to be available.
 *
 * @example
 * it(..matchWrittenFiles('eureka', () => ['file'], true));
 */
export const matchWrittenFiles = (title: string, expectedFilesGetter: () => string[], shouldMatch: boolean): [string, () => void] => [
  shouldMatch ? `writes ${title} files` : `doesn't write ${title} files`,
  () => {
    if (shouldMatch) {
      runResult.assertFile(expectedFilesGetter());
    } else {
      runResult.assertNoFile(expectedFilesGetter());
    }
  },
];

/**
 * Requires a global `it` function to be available.
 *
 * @example
 * it(..matchWrittenFiles('eureka', { 'generator-jhipster': { config: true } }, true));
 */
export const matchWrittenConfig = (title: string, config: any, shouldMatch: boolean): [string, () => void] => [
  shouldMatch ? `writes ${title} config` : `doesn't write ${title} config`,
  () => {
    if (shouldMatch) {
      runResult.assertJsonFileContent('.yo-rc.json', config);
    } else {
      runResult.assertNoJsonFileContent('.yo-rc.json', config);
    }
  },
];

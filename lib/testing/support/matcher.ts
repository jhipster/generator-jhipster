import { runResult } from '../helpers.js';

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

import type { RunResult } from 'yeoman-test';

export const matchWrittenFiles = (
  title: string,
  resultGetter: () => RunResult,
  expectedFilesGetter: () => string[],
  shouldMatch: boolean
) => {
  const testTitle = shouldMatch ? `writes ${title} files` : `doesn't write ${title} files`;
  it(testTitle, () => {
    const expectedFiles = expectedFilesGetter();
    if (shouldMatch) {
      resultGetter().assertFile(expectedFiles);
    } else {
      resultGetter().assertNoFile(expectedFiles);
    }
  });
};

export const matchWrittenConfig = (title: string, resultGetter: () => RunResult, config: any, shouldMatch: boolean) => {
  const testTitle = shouldMatch ? `writes ${title} config` : `doesn't write ${title} config`;
  it(testTitle, () => {
    if (shouldMatch) {
      resultGetter().assertJsonFileContent('.yo-rc.json', config);
    } else {
      resultGetter().assertNoJsonFileContent('.yo-rc.json', config);
    }
  });
};

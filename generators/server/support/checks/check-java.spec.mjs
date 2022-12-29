import { mock } from '@node-loaders/mock';
import { jestExpect as expect } from 'mocha-expect-snapshot';

const createExecaMock = mockedResult => ({
  execaCommandSync: () => ({
    command: 'java',
    escapedCommand: 'java',
    exitCode: 0,
    stdout: '',
    stderr: '',
    failed: false,
    timedOut: false,
    killed: false,
    ...mockedResult,
  }),
});

describe('checkJava', () => {
  describe('with valid java --version output', () => {
    const stderr = 'openjdk 17.0.1 2021-10-19';
    let result;

    before(async () => {
      const { default: checkJava } = await mock('./check-java.mjs', { execa: createExecaMock({ stderr }) });
      result = checkJava();
    });

    it('should return info and javaVersion', async () => {
      expect(result).toMatchObject({
        info: 'Detected java version 17.0.1',
        javaVersion: '17.0.1',
      });
    });
  });

  describe('with invalid java --version output', () => {
    const stderr = 'foo';
    const exitCode = 1;
    let result;

    before(async () => {
      const { default: checkJava } = await mock('./check-java.mjs', { execa: createExecaMock({ exitCode, stderr }) });
      result = checkJava();
    });

    it('should return error', async () => {
      expect(result.error).toBe('Error parsing Java version. Output: foo');
    });
  });

  describe('on exception', () => {
    let result;

    before(async () => {
      const { default: checkJava } = await mock('./check-java.mjs', {
        execa: {
          execaCommandSync: () => {
            throw new Error('foo');
          },
        },
      });
      result = checkJava();
    });

    it('should return error', async () => {
      expect(result.error).toBe('Java was not found on your computer (foo).');
    });
  });
});

import { after, before, describe, esmocha, expect, it, resetAllMocks } from 'esmocha';

const { execaCommandSync } = await esmocha.mock('execa', import('execa'));

const baseResult = {
  cwd: '',
  command: 'java',
  escapedCommand: 'java',
  exitCode: 0,
  stdout: '',
  stderr: '',
  failed: false,
  timedOut: false,
} as any;

describe('generator - server - checkJava', () => {
  after(() => {
    esmocha.reset();
  });
  afterEach(() => {
    resetAllMocks();
  });

  describe('with valid java --version output', () => {
    const stderr = 'openjdk 17.0.1 2021-10-19';
    let result;

    before(async () => {
      execaCommandSync.mockReturnValue({ ...baseResult, stderr });
      const { default: checkJava } = await import('./check-java.js');
      result = checkJava([]);
    });

    it('should return info and javaVersion', async () => {
      expect(result).toMatchObject({
        debug: 'Detected java version 17.0.1',
        javaVersion: '17.0.1',
      });
    });
  });

  describe('with invalid java --version output', () => {
    const stderr = 'foo';
    const exitCode = 1;
    let result;

    before(async () => {
      execaCommandSync.mockReturnValue({ ...baseResult, exitCode, stderr });
      const { default: checkJava } = await import('./check-java.js');
      result = checkJava([]);
    });

    it('should return error', async () => {
      expect(result.error).toBe('Error parsing Java version. Output: foo');
    });
  });

  describe('on exception', () => {
    let result;

    before(async () => {
      execaCommandSync.mockImplementation(() => {
        throw new Error('foo');
      });
      const { default: checkJava } = await import('./check-java.js');
      result = checkJava([]);
    });

    it('should return error', async () => {
      expect(result.error).toBe('Java was not found on your computer (foo).');
    });
  });
});

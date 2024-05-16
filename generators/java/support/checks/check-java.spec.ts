import { after, before, it, describe, expect, resetAllMocks, esmocha } from 'esmocha';
import { SyncResult } from 'execa';
import quibble from 'quibble';

const execa = { execa: esmocha.fn(), execaSync: esmocha.fn(), execaCommandSync: esmocha.fn(), execaCommand: esmocha.fn() };

const baseResult: SyncResult = {
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
  before(async () => {
    await quibble.esm('execa', execa);
  });
  after(() => {
    quibble.reset();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('with valid java --version output', () => {
    const stderr = 'openjdk 17.0.1 2021-10-19';
    let result;

    before(async () => {
      execa.execaCommandSync.mockReturnValue({ ...baseResult, stderr } as any);
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
      execa.execaCommandSync.mockReturnValue({ ...baseResult, exitCode, stderr } as any);
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
      execa.execaCommandSync.mockImplementation(() => {
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

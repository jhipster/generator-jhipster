import assert from 'yeoman-assert';
import fse from 'fs-extra';
import { mock, maxDepth, importMock, resetAllMocks } from '@node-loaders/jest-mock';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { testInTempDir, revertTempDir } from './utils/utils.cjs';
import packageJson from '../../package.json' assert { type: 'json' };

await mock<typeof import('../../cli/utils.mjs')>('../../cli/utils.mjs');
const importJdlMockedModule = await mock<typeof import('../../cli/import-jdl.mjs')>('../../cli/import-jdl.mjs');
const httpsMockedModule = await mock<typeof import('https')>('https');

const { default: mockedJdlCommand } = await importMock<typeof import('../../cli/jdl.mjs')>('../../cli/jdl.mjs', {
  [maxDepth]: 2,
});

const jdlMockedModule = await mock<typeof import('../../cli/jdl.mjs')>('../../cli/jdl.mjs');
const { buildJHipster } = await import('../../cli/program.mjs');
const mockCli = async (argv: string[]) => {
  const program = await buildJHipster({ printLogo: () => {} });
  return program.parseAsync(argv);
};

describe('cli - jdl command', () => {
  let originalCwd;
  beforeEach(async () => {
    resetAllMocks();
  });
  before(() => {
    originalCwd = testInTempDir(() => {});
  });
  after(() => {
    revertTempDir(originalCwd);
  });
  describe('cli - ', () => {
    describe('with 1 argument and options', () => {
      beforeEach(async () => {
        await mockCli(['jhipster', 'jhipster', 'jdl', 'foo.jdl', '--json-only']);
      });
      it('should call jdl.js with foo.jdl arg', () => {
        expect(jdlMockedModule.default).toHaveBeenCalledWith(
          [['foo.jdl']],
          expect.objectContaining({ jsonOnly: true }),
          expect.any(Object),
          expect.any(Object),
          expect.any(Function)
        );
      });
    });
    describe('with 2 argument and options', () => {
      beforeEach(async () => {
        await mockCli(['jhipster', 'jhipster', 'jdl', 'foo.jdl', 'bar.jdl', '--json-only']);
      });
      it('should call jdl.js with foo.jdl and bar.jdl arguments', () => {
        expect(jdlMockedModule.default).toHaveBeenNthCalledWith(
          1,
          [['foo.jdl', 'bar.jdl']],
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
          expect.any(Function)
        );
      });
      it('should forward options to jdl.js', () => {
        expect(jdlMockedModule.default).toHaveBeenNthCalledWith(
          1,
          expect.any(Array),
          expect.objectContaining({ jsonOnly: true }),
          expect.any(Object),
          expect.any(Object),
          expect.any(Function)
        );
      });
    });
  });
  describe('with local file', () => {
    const jdlReturn = { foo: 'bar' };
    beforeEach(() => {
      fse.writeFileSync('foo.jdl', '');
      fse.writeFileSync('bar.jdl', '');
      importJdlMockedModule.default.mockImplementation(() => jdlReturn as any);
    });
    afterEach(() => {
      fse.removeSync('foo.jdl');
      fse.removeSync('bar.jdl');
    });

    describe('when passing foo.jdl', () => {
      let resolved;
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      beforeEach(async () => {
        resolved = await mockedJdlCommand([['foo.jdl']], options, env, fork);
      });
      it('should not call https.get', () => {
        expect(httpsMockedModule.get).not.toHaveBeenCalled();
      });
      it('should pass foo.jdl to importJdl', () => {
        expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
          1,
          ['foo.jdl'],
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
          undefined
        );
      });
      it('should return the importJdl return', () => {
        expect(resolved).toBe(jdlReturn);
      });
      it('it should forward options, env, fork', () => {
        expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(1, expect.any(Array), options, env, fork, undefined);
      });
    });
    describe('when passing foo.jdl and bar.jdl', () => {
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      beforeEach(async () => {
        await mockedJdlCommand([['foo.jdl', 'bar.jdl']], options, env, fork);
      });
      it('should not call https.get', () => {
        expect(httpsMockedModule.get).not.toHaveBeenCalled();
      });
      it('should pass foo.jdl and bar.jdl to importJdl', () => {
        expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
          1,
          ['foo.jdl', 'bar.jdl'],
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
          undefined
        );
      });
    });
  });
  describe('without local file', () => {
    describe('when passing skipSampleRepository=true', () => {
      describe('with local file argument', () => {
        it('should return file not found', async () => {
          try {
            await mockedJdlCommand([['foo.jdl']], { bar: 'foo', skipSampleRepository: true }, { env: 'foo' }, { fork: 'foo' });
            assert.fail('Should fail');
          } catch (error) {
            expect(httpsMockedModule.get).not.toHaveBeenCalled();
            expect(error.message).toMatch('Could not find foo.jdl');
          }
        });
      });
      describe('with url argument', () => {
        const jdlReturn = { foo: 'bar' };
        beforeEach(() => {
          // Fake a success response
          const response = { statusCode: 200, pipe: fileStream => fileStream.close() };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          httpsMockedModule.get.mockImplementation((_url: any, cb: any) => {
            cb(response);
            return { on: () => {} } as any;
          });
          importJdlMockedModule.default.mockImplementation(() => jdlReturn as any);
        });
        it('should call https.get', async () => {
          await mockedJdlCommand(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          );
          expect(httpsMockedModule.get).toHaveBeenCalledTimes(1);
          expect(httpsMockedModule.get).toHaveBeenCalledWith(
            'https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl',
            expect.any(Function)
          );
        });
        it('should call importJdl', async () => {
          await mockedJdlCommand(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          );
          expect(importJdlMockedModule.default).toHaveBeenCalledTimes(1);
          expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
            1,
            ['foo.jdl'],
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            undefined
          );
        });
      });
    });
    describe('with success get response', () => {
      const jdlReturn = { foo: 'bar' };
      beforeEach(() => {
        // Fake a success response
        const response = { pipe: fileStream => fileStream.close() };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        httpsMockedModule.get.mockImplementation((url: any, cb: any) => {
          if (url.includes(`v${packageJson.version}`)) {
            cb({ ...response, statusCode: 400 });
          } else {
            cb({ ...response, statusCode: 200 });
          }
          return { on: () => {} } as any;
        });
        importJdlMockedModule.default.mockImplementation(() => jdlReturn as any);
      });
      afterEach(() => {
        fse.removeSync('foo.jh');
        fse.removeSync('foo.jdl');
        fse.removeSync('bar.jdl');
      });

      describe('when passing foo.jh', () => {
        let resolved;
        const options = { bar: 'foo' };
        const env = { env: 'foo' };
        const fork = { fork: 'foo' };

        beforeEach(async () => {
          resolved = await mockedJdlCommand([['foo.jh']], options, env, fork);
        });

        it('should pass to https.get with jdl-sample repository', () => {
          expect(httpsMockedModule.get).toHaveBeenNthCalledWith(
            1,
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`,
            expect.any(Function)
          );
          expect(httpsMockedModule.get).toHaveBeenNthCalledWith(
            2,
            'https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh',
            expect.any(Function)
          );
        });
        it('should pass foo.jh to importJdl', () => {
          expect(importJdlMockedModule.default).toHaveBeenCalledTimes(1);
          expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
            1,
            ['foo.jh'],
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            undefined
          );
        });
        it('should return the importJdl return', () => {
          expect(resolved).toBe(jdlReturn);
        });
        it('should create the destination file', () => {
          assert.file('foo.jh');
        });
        it('it should forward options, env, fork', () => {
          expect(importJdlMockedModule.default).toHaveBeenCalledTimes(1);
          expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(1, expect.any(Array), options, env, fork, undefined);
        });
      });

      describe('when passing foo', () => {
        beforeEach(async () => {
          await mockedJdlCommand([['foo']]);
        });
        it('should append jdl extension and pass to https.get with jdl-sample repository', () => {
          expect(httpsMockedModule.get).toHaveBeenNthCalledWith(
            1,
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jdl`,
            expect.any(Function)
          );
          expect(httpsMockedModule.get).toHaveBeenNthCalledWith(
            2,
            'https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl',
            expect.any(Function)
          );
        });
        it('should pass foo.jdl to importJdl', () => {
          expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
            1,
            ['foo.jdl'],
            expect.any(Object),
            undefined,
            undefined,
            undefined
          );
        });
        it('should create the destination file', () => {
          assert.file('foo.jdl');
        });
      });

      describe('with a complete url', () => {
        const url = 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/bar.jdl';
        beforeEach(async () => {
          await mockedJdlCommand([[url]]);
        });
        it('should forward the url to get', () => {
          expect(httpsMockedModule.get).toHaveBeenNthCalledWith(1, url, expect.any(Function));
        });
        it('should pass the basename to importJdl', () => {
          expect(importJdlMockedModule.default).toHaveBeenCalledTimes(1);
          expect(importJdlMockedModule.default).toHaveBeenNthCalledWith(
            1,
            ['bar.jdl'],
            expect.any(Object),
            undefined,
            undefined,
            undefined
          );
        });
        it('should create the destination file', () => {
          assert.file('bar.jdl');
        });
      });
    });

    describe('with failed get response', () => {
      describe('with statusCode different than 200', () => {
        let response;
        beforeEach(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          httpsMockedModule.get.mockImplementation((_url: any, cb: any) => {
            cb(response);
            return { on: () => {} } as any;
          });
        });
        before(() => {
          response = { statusCode: 404, statusMessage: 'Custom message' };
        });

        it('should not create the destination file', async () => {
          try {
            await mockedJdlCommand([['foo.jh']]);
            throw new Error('Should throw');
          } catch (error) {
            assert.noFile('foo.jh');
          }
        });

        it('should print error message', async () => {
          try {
            await mockedJdlCommand([['foo.jh']]);
            throw new Error('Should throw');
          } catch (error) {
            assert.equal(
              error.message,
              'Error downloading https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh: 404 - Custom message'
            );
          }
        });
      });
    });
  });
});

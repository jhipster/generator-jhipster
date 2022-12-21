/* eslint-disable no-unused-expressions, no-console */

import assert from 'yeoman-assert';
import { expect } from 'chai';
import fse from 'fs-extra';
import { mock, maxDepth } from '@node-loaders/mock';
import sinon from 'sinon';

import { testInTempDir, revertTempDir } from './utils/utils.cjs';
import { buildJHipster } from '../../cli/program.mjs';
import packageJson from '../../package.json' assert { type: 'json' };

const mockCli = async (opts = {}) => {
  opts.loadCommand = key => opts[`./${key}`];
  const program = await buildJHipster(opts);
  const { argv } = opts;
  return program.parseAsync(argv);
};

describe('jdl command test', () => {
  let originalCwd;
  let logger;
  beforeEach(() => {
    logger = {
      // Silence info
      info: sinon.stub(),
      debug: sinon.stub(),
    };
  });
  before(() => {
    originalCwd = testInTempDir(() => {}, true);
  });
  after(() => {
    revertTempDir(originalCwd);
  });
  describe('jhipster cli', () => {
    describe('with 1 argument and options', () => {
      let oldArgv;
      let jdlStub;
      beforeEach(() => {
        oldArgv = process.argv;
        process.argv = ['jhipster', 'jhipster', 'jdl', 'foo.jdl', '--json-only'];
        jdlStub = sinon.stub();
        return mockCli({ './jdl': jdlStub });
      });
      afterEach(() => {
        process.argv = oldArgv;
      });
      it('should call jdl.js with foo.jdl arg', () => {
        expect(jdlStub.getCall(0).args[0]).to.be.eql([['foo.jdl']]);
      });
      it('should forward options to jdl.js', () => {
        expect(jdlStub.getCall(0).args[1].jsonOnly).to.be.true;
      });
    });
    describe('with 2 argument and options', () => {
      let sandbox;
      let jdlStub;
      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(process, 'argv').value(['jhipster', 'jhipster', 'jdl', 'foo.jdl', 'bar.jdl', '--json-only']);
        jdlStub = sinon.stub();
        return mockCli({ './jdl': jdlStub });
      });
      afterEach(() => {
        sandbox.restore();
      });
      it('should call jdl.js with foo.jdl and bar.jdl arguments', () => {
        expect(jdlStub.getCall(0).args[0]).to.be.eql([['foo.jdl', 'bar.jdl']]);
      });
      it('should forward options to jdl.js', () => {
        expect(jdlStub.getCall(0).args[1].jsonOnly).to.be.true;
      });
    });
  });
  describe('with local file', () => {
    let importJdlStub;
    const jdlReturn = { foo: 'bar' };
    let get;
    beforeEach(() => {
      fse.writeFileSync('foo.jdl', '');
      fse.writeFileSync('bar.jdl', '');
      importJdlStub = sinon.stub().callsFake(() => {
        return jdlReturn;
      });
      get = sinon.stub();
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
        const mockedModule = (
          await mock('../../cli/jdl.mjs', {
            [maxDepth]: -1,
            './import-jdl.mjs': { default: importJdlStub },
            https: { get },
            './utils.mjs': { logger },
          })
        ).default;
        await mockedModule([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
        });
      });
      it('should not call https.get', () => {
        expect(get.callCount).to.be.equal(0);
      });
      it('should pass foo.jdl to importJdl', () => {
        expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl']);
      });
      it('should return the importJdl return', () => {
        expect(resolved).to.be.equal(jdlReturn);
      });
      it('it should forward options, env, fork', () => {
        expect(importJdlStub.getCall(0).args[1]).to.be.equal(options);
        expect(importJdlStub.getCall(0).args[2]).to.be.equal(env);
        expect(importJdlStub.getCall(0).args[3]).to.be.equal(fork);
      });
    });
    describe('when passing foo.jdl and bar.jdl', () => {
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      beforeEach(async () => {
        const { default: importJdl } = await mock('../../cli/jdl.mjs', {
          [maxDepth]: -1,
          './import-jdl.mjs': { default: importJdlStub },
          https: { get },
          './utils.mjs': { logger },
        });
        await importJdl([['foo.jdl', 'bar.jdl']], options, env, fork);
      });
      it('should not call https.get', () => {
        expect(get.callCount).to.be.equal(0);
      });
      it('should pass foo.jdl and bar.jdl to importJdl', () => {
        expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl', 'bar.jdl']);
      });
    });
  });
  describe('without local file', () => {
    describe('when passing skipSampleRepository=true', () => {
      describe('with local file argument', () => {
        let get;
        beforeEach(() => {
          get = sinon.stub();
        });
        it('should return file not found', async () => {
          const importJdl = (
            await mock('../../cli/jdl.mjs', {
              [maxDepth]: -1,
              https: { get },
              './utils.mjs': { logger },
            })
          ).default;
          return importJdl([['foo.jdl']], { bar: 'foo', skipSampleRepository: true }, { env: 'foo' }, { fork: 'foo' }).then(
            () => assert.fail('Should fail'),
            error => {
              expect(get.callCount).to.be.equal(0);
              expect(error.message).to.include('Could not find foo.jdl');
            }
          );
        });
      });
      describe('with url argument', () => {
        let importJdlStub;
        const jdlReturn = { foo: 'bar' };
        let get;
        beforeEach(() => {
          get = sinon.stub();
        });
        beforeEach(() => {
          // Fake a success response
          const response = { statusCode: 200, pipe: fileStream => fileStream.close() };
          get = sinon.stub().callsFake((_url, cb) => {
            cb(response);
            return { on: () => {} };
          });
          // Fake a success import jdl
          importJdlStub = sinon.stub().callsFake(() => {
            return jdlReturn;
          });
        });
        it('should call https.get', async () => {
          const importJdl = (
            await mock('../../cli/jdl.mjs', {
              [maxDepth]: -1,
              './import-jdl.mjs': { default: importJdlStub },
              https: { get },
              './utils.mjs': { logger },
            })
          ).default;
          importJdl(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          ).then(() => {
            expect(get.callCount).to.be.equal(1);
            expect(get.getCall(0).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl');
          });
        });
        it('should call importJdl', async () => {
          const importJdl = (
            await mock('../../cli/jdl.mjs', {
              [maxDepth]: -1,
              './import-jdl.mjs': { default: importJdlStub },
              https: { get },
              './utils.mjs': { logger },
            })
          ).default;
          importJdl(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          ).then(() => {
            expect(importJdlStub.callCount).to.be.equal(1);
            expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl']);
          });
        });
      });
    });
    describe('with success get response', () => {
      let importJdlStub;
      const jdlReturn = { foo: 'bar' };
      let get;
      beforeEach(() => {
        // Fake a success response
        const response = { pipe: fileStream => fileStream.close() };
        get = sinon.stub().callsFake((url, cb) => {
          if (url.includes(`v${packageJson.version}`)) {
            cb({ ...response, statusCode: 400 });
          } else {
            cb({ ...response, statusCode: 200 });
          }
          return { on: () => {} };
        });
        importJdlStub = sinon.stub().callsFake(() => {
          return jdlReturn;
        });
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
          const importJdl = (
            await mock('../../cli/jdl.mjs', {
              [maxDepth]: -1,
              './import-jdl.mjs': { default: importJdlStub },
              https: { get },
              './utils.mjs': { logger },
            })
          ).default;
          return importJdl([['foo.jh']], options, env, fork).then(jdlFiles => {
            resolved = jdlFiles;
          });
        });
        it('should pass to https.get with jdl-sample repository', () => {
          expect(get.getCall(0).args[0]).to.be.equal(
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`
          );
          expect(get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh');
        });
        it('should pass foo.jh to importJdl', () => {
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jh']);
        });
        it('should return the importJdl return', () => {
          expect(resolved).to.be.equal(jdlReturn);
        });
        it('should create the destination file', () => {
          assert.file('foo.jh');
        });
        it('it should forward options, env, fork', () => {
          expect(importJdlStub.getCall(0).args[1]).to.be.equal(options);
          expect(importJdlStub.getCall(0).args[2]).to.be.equal(env);
          expect(importJdlStub.getCall(0).args[3]).to.be.equal(fork);
        });
      });

      describe('when passing foo', () => {
        beforeEach(async () => {
          const { default: jdlCommand } = await mock('../../cli/jdl.mjs', {
            [maxDepth]: -1,
            './import-jdl.mjs': { default: importJdlStub },
            https: { get },
            './utils.mjs': { logger },
          });
          await jdlCommand([['foo']]);
        });
        it('should append jdl extension and pass to https.get with jdl-sample repository', () => {
          expect(get.getCall(0).args[0]).to.be.equal(
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jdl`
          );
          expect(get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl');
        });
        it('should pass foo.jdl to importJdl', () => {
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl']);
        });
        it('should create the destination file', () => {
          assert.file('foo.jdl');
        });
      });

      describe('with a complete url', () => {
        const url = 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/bar.jdl';
        beforeEach(async () => {
          const jdlCommand = (
            await mock('../../cli/jdl.mjs', {
              [maxDepth]: -1,
              './import-jdl.mjs': { default: importJdlStub },
              https: { get },
              './utils.mjs': { logger },
            })
          ).default;
          await jdlCommand([[url]]);
        });
        it('should forward the url to get', () => {
          expect(get.getCall(0).args[0]).to.be.equal(url);
        });
        it('should pass the basename to importJdl', () => {
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['bar.jdl']);
        });
        it('should create the destination file', () => {
          assert.file('bar.jdl');
        });
      });
    });

    describe('with failed get response', () => {
      describe('with statusCode different than 200', () => {
        let response;
        let get;
        beforeEach(() => {
          get = sinon.stub().callsFake((_url, cb) => {
            cb(response);
            return { on: () => {} };
          });
          logger.error = sinon.stub();
        });
        before(() => {
          response = { statusCode: 404, statusMessage: 'Custom message' };
        });

        it('should not create the destination file', async () => {
          const { default: jdlCommand } = await mock('../../cli/jdl.mjs', {
            [maxDepth]: -1,
            './import-jdl.mjs': () => {},
            https: { get },
            './utils.mjs': { logger },
          });
          try {
            await jdlCommand([['foo.jh']]);
            throw new Error('Should throw');
          } catch (error) {
            assert.noFile('foo.jh');
          }
        });

        it('should print error message', async () => {
          const { default: jdlCommand } = await mock('../../cli/jdl.mjs', {
            [maxDepth]: -1,
            './import-jdl.mjs': () => {},
            https: { get },
            './utils.mjs': { logger },
          });
          try {
            await jdlCommand([['foo.jh']]);
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

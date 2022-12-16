/* eslint-disable no-unused-expressions, no-console */

import { expect } from 'chai';

import chai from 'chai';
import tdChai from 'testdouble-chai';

import sinon from 'sinon';
import * as td from 'testdouble';

import { testInTempDir, revertTempDir } from './utils/utils.cjs';
import { buildJHipster } from '../../cli/program.mjs';
import { logger } from '../../cli/utils.mjs';

chai.use(tdChai(td));

const mockCli = (opts = {}) => {
  opts.loadCommand = key => opts[`./${key}`];
  const program = buildJHipster(opts);
  const { argv } = opts;
  return program.parseAsync(argv);
};

describe('jdl command test', () => {
  let originalCwd;
  before(() => {
    originalCwd = testInTempDir(() => {}, true);
    // Silence info
    sinon.stub(logger, 'info');
  });
  after(() => {
    revertTempDir(originalCwd);
    logger.info.restore();
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
});

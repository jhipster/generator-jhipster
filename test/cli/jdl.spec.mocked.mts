/* eslint-disable no-unused-expressions, no-console */

import assert from 'yeoman-assert';

import chai, { expect } from 'chai';
import tdChai from 'testdouble-chai';

import https from 'https';
import fse from 'fs-extra';
import sinon from 'sinon';
import * as td from 'testdouble';

import { testInTempDir, revertTempDir } from './utils/utils.cjs';
import packageJson from '../../package.json';
import cliUtils from '../../cli/utils.cjs';

const { logger } = cliUtils;
chai.use(tdChai(td));

describe('jdl mocked command test', () => {
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

  describe('with local file', () => {
    let importJdlStub;
    const jdlReturn = { foo: 'bar' };
    beforeEach(() => {
      fse.writeFileSync('foo.jdl', '');
      fse.writeFileSync('bar.jdl', '');
      importJdlStub = sinon.stub().callsFake(() => {
        return jdlReturn;
      });
      sinon.stub(https, 'get');
    });
    afterEach(() => {
      https.get.restore();
      fse.removeSync('foo.jdl');
      fse.removeSync('bar.jdl');
    });

    describe('when passing foo.jdl', () => {
      let resolved;
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      let moduleToMock;
      let moduleToTest;
      beforeEach(async () => {
        moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
        moduleToTest = (await import('../../cli/jdl.mjs')).default;
        td.when(
          moduleToMock(
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything()
          )
        ).thenReturn(importJdlStub(['foo.jdl'], options, env, fork));
      });
      afterEach(() => {
        td.reset();
      });
      it('should not call https.get', done => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
          expect(https.get.callCount).to.be.equal(0);
          done();
        });
      });
      it('should pass foo.jdl to importJdl', done => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
          td.verify(
            moduleToMock(['foo.jdl'], td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), td.matchers.anything())
          );
          done();
        });
      });
      it('should return the importJdl return', done => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
          expect(resolved).to.be.equal(jdlReturn);
          done();
        });
      });
      it('it should forward options, env, fork', done => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
          td.verify(moduleToMock(td.matchers.anything(), options, env, fork, td.matchers.anything()));
          done();
        });
      });
    });
    describe('when passing foo.jdl and bar.jdl', () => {
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      let moduleToTest;
      let moduleToMock;
      beforeEach(async () => {
        moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
        moduleToTest = (await import('../../cli/jdl.mjs')).default;
        td.when(
          moduleToMock(
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything()
          )
        ).thenReturn(importJdlStub(['foo.jdl', 'bar.jdl'], options, env, fork));
      });
      afterEach(() => {
        td.reset();
      });
      it('should not call https.get', () => {
        moduleToTest([['foo.jdl', 'bar.jdl']], options, env, fork);
        expect(https.get.callCount).to.be.equal(0);
      });
      it('should pass foo.jdl and bar.jdl to importJdl', done => {
        moduleToTest([['foo.jdl', 'bar.jdl']], options, env, fork).then(() => {
          expect(moduleToMock).to.have.been.calledWith(
            ['foo.jdl', 'bar.jdl'],
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything()
          );
          done();
        });
      });
    });
  });
  describe('without local file', () => {
    describe('when passing skipSampleRepository=true', () => {
      describe('with local file argument', () => {
        let moduleToTest;
        beforeEach(async () => {
          sinon.stub(https, 'get');
          const moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn({});
        });
        afterEach(() => {
          https.get.restore();
          td.reset();
        });
        it('should return file not found', done => {
          moduleToTest([['foo.jdl']], { bar: 'foo', skipSampleRepository: true }, { env: 'foo' }, { fork: 'foo' }).then(
            () => assert.fail('Should fail'),
            error => {
              expect(https.get.callCount).to.be.equal(0);
              expect(error.message).to.include('Could not find foo.jdl');
              done();
            }
          );
        });
      });
      describe('with url argument', () => {
        let importJdlStub;
        const jdlReturn = { foo: 'bar' };
        let moduleToTest;
        let moduleToMock;
        beforeEach(async () => {
          // Fake a success response
          const response = { statusCode: 200, pipe: fileStream => fileStream.close() };
          sinon.stub(https, 'get').callsFake((_url, cb) => {
            cb(response);
            return { on: () => {} };
          });
          // Fake a success import jdl
          importJdlStub = sinon.stub().callsFake(() => {
            return jdlReturn;
          });
          moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(
            importJdlStub(
              [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
              { bar: 'foo', skipSampleRepository: true },
              { env: 'foo' },
              { fork: 'foo' }
            )
          );
        });
        afterEach(() => {
          https.get.restore();
          td.reset();
        });
        it('should call https.get', done => {
          moduleToTest(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          ).then(() => {
            expect(https.get.callCount).to.be.equal(1);
            expect(https.get.getCall(0).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl');
            done();
          });
        });
        it('should call importJdl', done => {
          moduleToTest(
            [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
            { bar: 'foo', skipSampleRepository: true },
            { env: 'foo' },
            { fork: 'foo' }
          ).then(() => {
            expect(importJdlStub.callCount).to.be.equal(1);
            expect(moduleToMock).to.have.been.calledWith(
              ['foo.jdl'],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            );
            done();
          });
        });
      });
    });
    describe('with success get response', () => {
      let importJdlStub;
      const jdlReturn = { foo: 'bar' };
      beforeEach(() => {
        // Fake a success response
        const response = { pipe: fileStream => fileStream.close() };
        sinon.stub(https, 'get').callsFake((url, cb) => {
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
        https.get.restore();
        fse.removeSync('foo.jh');
        fse.removeSync('foo.jdl');
        fse.removeSync('bar.jdl');
        td.reset();
      });

      describe('when passing foo.jh', () => {
        const options = { bar: 'foo' };
        const env = { env: 'foo' };
        const fork = { fork: 'foo' };
        let moduleToTest;
        let moduleToMock;
        beforeEach(async () => {
          moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(importJdlStub(['foo.jh'], options, env, fork));
        });

        afterEach(() => {
          td.reset();
        });

        it('should pass to https.get with jdl-sample repository', done => {
          moduleToTest([['foo.jh']], options, env, fork).then(() => {
            expect(https.get.getCall(0).args[0]).to.be.equal(
              `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`
            );
            expect(https.get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh');
            done();
          });
        });
        it('should pass foo.jh to importJdl', done => {
          moduleToTest([['foo.jh']], options, env, fork).then(() => {
            expect(moduleToMock).to.have.been.calledWith(
              ['foo.jh'],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            );
            done();
          });
        });
        it('should return the importJdl return', done => {
          moduleToTest([['foo.jh']], options, env, fork).then(files => {
            expect(files).to.be.equal(jdlReturn);
            done();
          });
        });
        it('should create the destination file', done => {
          moduleToTest([['foo.jh']], options, env, fork).then(() => {
            assert.file('foo.jh');
            done();
          });
        });
        it('it should forward options, env, fork', done => {
          moduleToTest([['foo.jh']], options, env, fork).then(() => {
            expect(moduleToMock).to.have.been.calledWith(td.matchers.anything(), options, env, fork, td.matchers.anything());
            done();
          });
        });
      });

      describe('when passing foo', () => {
        let moduleToTest;
        let moduleToMock;
        beforeEach(async () => {
          moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(importJdlStub(['foo.jh']));
        });

        afterEach(() => {
          td.reset();
        });

        it('should append jdl extension and pass to https.get with jdl-sample repository', done => {
          moduleToTest([['foo.jh']]).then(() => {
            expect(https.get.getCall(0).args[0]).to.be.equal(
              `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`
            );
            expect(https.get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh');
            done();
          });
        });
        it('should pass foo.jdl to importJdl', done => {
          moduleToTest([['foo.jh']]).then(() => {
            expect(moduleToMock).to.have.been.calledWith(
              ['foo.jh'],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            );
            done();
          });
        });
        it('should create the destination file', done => {
          moduleToTest([['foo.jh']]).then(() => {
            assert.file('foo.jh');
            done();
          });
        });
      });

      describe('with a complete url', () => {
        const url = 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/bar.jdl';
        let moduleToTest;
        let moduleToMock;
        beforeEach(async () => {
          moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(importJdlStub([url]));
        });

        afterEach(() => {
          td.reset();
        });

        it('should forward the url to get', done => {
          moduleToTest([[url]]).then(() => {
            expect(https.get.getCall(0).args[0]).to.be.equal(url);
            done();
          });
        });
        it('should pass the basename to importJdl', done => {
          moduleToTest([[url]]).then(() => {
            expect(moduleToMock).to.have.been.calledWith(
              ['bar.jdl'],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            );
            done();
          });
        });
        it('should create the destination file', done => {
          moduleToTest([[url]]).then(() => {
            assert.file('bar.jdl');
            done();
          });
          moduleToTest([[url]]);
        });
      });
    });

    describe('with failed get response', () => {
      describe('with statusCode different than 200', () => {
        let response;
        beforeEach(() => {
          sinon.stub(https, 'get').callsFake((_url, cb) => {
            cb(response);
            return { on: () => {} };
          });
          sinon.stub(logger, 'error');
        });
        afterEach(() => {
          https.get.restore();
          logger.error.restore();
          td.reset();
        });
        before(() => {
          response = { statusCode: 404, statusMessage: 'Custom message' };
        });

        it('should not create the destination file', async () => {
          const moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          const moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => {});
          moduleToTest([['foo.jh']]).catch(() => {
            assert.noFile('foo.jh');
          });
        });

        it('should print error message', async () => {
          const moduleToMock = (await td.replaceEsm('../../cli/import-jdl.mjs')).default;
          const moduleToTest = (await import('../../cli/jdl.mjs')).default;
          td.when(
            moduleToMock(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => {});

          moduleToTest([['foo.jh']]).catch(error => {
            assert.equal(
              error.message,
              'Error downloading https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh: 404 - Custom message'
            );
          });
        });
      });
    });
  });
});

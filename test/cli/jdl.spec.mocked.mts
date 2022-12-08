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
import jdl from '../../cli/import-jdl.mjs';

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
        td.when(moduleToMock(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(
          importJdlStub([['foo.jdl']], options, env, fork)
        );
      });
      afterEach(() => {
        td.reset();
      });
      it('should not call https.get', () => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
        });
        expect(https.get.callCount).to.be.equal(0);
      });
      it('should pass foo.jdl to importJdl', () => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
        });
        td.verify(moduleToMock([['foo.jdl']], td.matchers.anything(), td.matchers.anything(), td.matchers.anything()));
      });
      it('should return the importJdl return', () => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
        });
        expect(resolved).to.be.equal(jdlReturn);
      });
      it('it should forward options, env, fork', () => {
        moduleToTest([['foo.jdl']], options, env, fork).then(jdlFiles => {
          resolved = jdlFiles;
        });
        expect(moduleToMock).to.have.been.calledWith(td.matchers.anything(), options, env, fork);
      });
    });
    describe('when passing foo.jdl and bar.jdl', () => {
      const options = { bar: 'foo' };
      const env = { env: 'foo' };
      const fork = { fork: 'foo' };
      let moduleToTest;
      let moduleToMock;
      beforeEach(async () => {
        moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
        moduleToTest = await import('../../cli/jdl.mjs');
        td.when(
          moduleToMock.default(
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything()
          )
        ).thenReturn(importJdlStub([['foo.jdl', 'bar.jdl']], options, env, fork));
      });
      afterEach(() => {
        td.reset();
      });
      it('should not call https.get', () => {
        moduleToTest.default([['foo.jdl', 'bar.jdl']], options, env, fork);
        expect(https.get.callCount).to.be.equal(0);
      });
      it('should pass foo.jdl and bar.jdl to importJdl', () => {
        moduleToTest.default([['foo.jdl', 'bar.jdl']], options, env, fork);
        expect(moduleToMock).to.have.been.calledWith(['foo.jdl', 'bar.jdl']);
      });
    });
  });
  describe('without local file', () => {
    describe('when passing skipSampleRepository=true', () => {
      describe('with local file argument', () => {
        let moduleToTest;
        beforeEach(async () => {
          sinon.stub(https, 'get');
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
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
        it('should return file not found', () => {
          return moduleToTest.default(
            () => assert.fail('Should fail'),
            error => {
              expect(https.get.callCount).to.be.equal(0);
              expect(error.message).to.include('Could not find foo.jdl');
            }
          );
        });
      });
      describe('with url argument', () => {
        let importJdlStub;
        const jdlReturn = { foo: 'bar' };
        let moduleToTest;
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
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() =>
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
        it('should call https.get', () => {
          return moduleToTest
            .default(
              [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
              { bar: 'foo', skipSampleRepository: true },
              { env: 'foo' },
              { fork: 'foo' }
            )
            .then(() => {
              expect(https.get.callCount).to.be.equal(1);
              expect(https.get.getCall(0).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl');
            });
        });
        it('should call importJdl', () => {
          return moduleToTest
            .default(
              [['https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jdl']],
              { bar: 'foo', skipSampleRepository: true },
              { env: 'foo' },
              { fork: 'foo' }
            )
            .then(() => {
              expect(importJdlStub.callCount).to.be.equal(1);
              expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl']);
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
        let resolved;
        const options = { bar: 'foo' };
        const env = { env: 'foo' };
        const fork = { fork: 'foo' };
        let moduleToTest;
        beforeEach(async () => {
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() =>
            importJdlStub([['foo.jh']], options, env, fork).then(jdlFiles => {
              resolved = jdlFiles;
            })
          );
        });

        afterEach(() => {
          td.reset();
        });

        it('should pass to https.get with jdl-sample repository', () => {
          moduleToTest.default(['foo.jh'], options, env, fork);
          expect(https.get.getCall(0).args[0]).to.be.equal(
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`
          );
          expect(https.get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh');
        });
        it('should pass foo.jh to importJdl', () => {
          moduleToTest.default(['foo.jh'], options, env, fork);
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jh']);
        });
        it('should return the importJdl return', () => {
          moduleToTest.default(['foo.jh'], options, env, fork);
          expect(resolved).to.be.equal(jdlReturn);
        });
        it('should create the destination file', () => {
          moduleToTest.default(['foo.jh'], options, env, fork);
          assert.file('foo.jh');
        });
        it('it should forward options, env, fork', () => {
          moduleToTest.default(['foo.jh'], options, env, fork);
          expect(importJdlStub.getCall(0).args[1]).to.be.equal(options);
          expect(importJdlStub.getCall(0).args[2]).to.be.equal(env);
          expect(importJdlStub.getCall(0).args[3]).to.be.equal(fork);
        });
      });

      describe('when passing foo', () => {
        let moduleToTest;
        beforeEach(async () => {
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => importJdlStub([['foo.jh']]));
        });

        afterEach(() => {
          td.reset();
        });

        it('should append jdl extension and pass to https.get with jdl-sample repository', () => {
          moduleToTest.default([['foo.jh']]);
          expect(https.get.getCall(0).args[0]).to.be.equal(
            `https://raw.githubusercontent.com/jhipster/jdl-samples/v${packageJson.version}/foo.jh`
          );
          expect(https.get.getCall(1).args[0]).to.be.equal('https://raw.githubusercontent.com/jhipster/jdl-samples/main/foo.jh');
        });
        it('should pass foo.jdl to importJdl', () => {
          moduleToTest.default([['foo.jh']]);
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['foo.jdl']);
        });
        it('should create the destination file', () => {
          moduleToTest.default([['foo.jh']]);
          assert.file('foo.jdl');
        });
      });

      describe('with a complete url', () => {
        const url = 'https://raw.githubusercontent.com/jhipster/jdl-samples/main/bar.jdl';
        let moduleToTest;
        beforeEach(async () => {
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => importJdlStub([[url]]));
        });

        afterEach(() => {
          td.reset();
        });

        it('should forward the url to get', () => {
          moduleToTest.default([[url]]);
          expect(https.get.getCall(0).args[0]).to.be.equal(url);
        });
        it('should pass the basename to importJdl', () => {
          moduleToTest.default([[url]]);
          expect(importJdlStub.getCall(0).args[0]).to.be.eql(['bar.jdl']);
        });
        it('should create the destination file', () => {
          moduleToTest.default([[url]]);
          assert.file('bar.jdl');
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
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          const moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => {});
          moduleToTest.default([['foo.jh']]).catch(() => {
            assert.noFile('foo.jh');
          });
        });

        it('should print error message', async () => {
          const moduleToMock = await td.replaceEsm('../../cli/import-jdl.mjs');
          const moduleToTest = await import('../../cli/jdl.mjs');
          td.when(
            moduleToMock.default(
              [td.matchers.anything()],
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything(),
              td.matchers.anything()
            )
          ).thenReturn(() => {});

          moduleToTest.default([['foo.jh']]).catch(error => {
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

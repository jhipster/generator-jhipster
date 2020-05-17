/* eslint-disable no-unused-expressions, no-console */

const assert = require('yeoman-assert');
const expect = require('chai').expect;
const EventEmiter = require('events');
const https = require('https');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');

const { testInTempDir, revertTempDir } = require('../utils/utils');
const cliUtils = require('../../cli/utils');

const { logger } = cliUtils;

describe('sample command test', () => {
    describe('https get first argument', () => {
        let oldArgv;
        let events;
        beforeEach(() => {
            events = new EventEmiter();
            oldArgv = process.argv;
            sinon.stub(https, 'get').callsFake(() => {
                events.emit('done');
                return events;
            });
        });
        afterEach(() => {
            process.argv = oldArgv;
            https.get.restore();
        });

        describe('with extension', () => {
            it('should be jdl-sample repository file', done => {
                events.once('done', () => {
                    expect(https.get.getCall(0).args[0]).to.be.equal(
                        'https://raw.githubusercontent.com/jhipster/jdl-samples/master/foo.jh'
                    );
                    done();
                });
                proxyquire('../../cli/sample', {})(['foo.jh']);
            });
        });

        describe('without extension', () => {
            it('should be jdl-sample repository jdl file', done => {
                events.once('done', () => {
                    expect(https.get.getCall(0).args[0]).to.be.equal(
                        'https://raw.githubusercontent.com/jhipster/jdl-samples/master/foo.jdl'
                    );
                    done();
                });
                proxyquire('../../cli/sample', {})(['foo']);
            });
        });

        describe('with url', () => {
            it('should forward the url', done => {
                const url = 'https://raw.githubusercontent.com/jhipster/jdl-samples/master/bar.jdl';
                events.once('done', () => {
                    expect(https.get.getCall(0).args[0]).to.be.equal(url);
                    done();
                });
                proxyquire('../../cli/sample', {})([url]);
            });
        });
    });

    describe('https get response callback', () => {
        let oldArgv;
        let events;
        let response;
        let oldCwd;
        beforeEach(() => {
            events = new EventEmiter();
            oldArgv = process.argv;
            sinon.stub(https, 'get').callsFake((_url, cb) => {
                cb(response);
                events.emit('done');
                return events;
            });
            sinon.stub(logger, 'error');
            oldCwd = testInTempDir(() => {}, true);
        });
        afterEach(() => {
            process.argv = oldArgv;
            https.get.restore();
            logger.error.restore();
            delete require.cache[require.resolve('../../cli/cli')];
            revertTempDir(oldCwd);
        });

        describe('with statusCode 200', () => {
            before(() => {
                response = { statusCode: 200, pipe: fileStream => fileStream.close() };
            });
            it('should create the destination file', done => {
                events.once('done', () => {
                    assert.file('foo/foo.jh');
                    done();
                });
                proxyquire('../../cli/sample', {})(['foo.jh'], { downloadOnly: true });
            });
        });

        describe('with statusCode different than 200', () => {
            beforeEach(() => {
                process.argv = ['jhipster', 'jhipster', 'sample', 'foo.jh', '--download-only'];
            });
            before(() => {
                response = { statusCode: 404, statusMessage: 'Custom message' };
            });

            it('should not create the destination file', done => {
                events.once('done', () => {
                    assert.noFile('foo');
                    done();
                });
                proxyquire('../../cli/sample', {})(['foo.jh'], { downloadOnly: true });
            });

            it('should print error message', done => {
                events.once('done', () => {
                    expect(logger.error.getCall(0).args[0]).to.be.equal(
                        'Error downloading https://raw.githubusercontent.com/jhipster/jdl-samples/master/foo.jh: 404 - Custom message'
                    );
                    done();
                });
                proxyquire('../../cli/sample', {})(['foo.jh'], { downloadOnly: true });
            });
        });

        describe('without download-only option', () => {
            let sample;
            let stub;
            beforeEach(() => {
                process.argv = ['jhipster', 'jhipster', 'sample', 'foo.jh', '--foo'];
                stub = sinon.stub().callsFake(() => events.emit('importJdl'));
                sample = proxyquire('../../cli/sample', { './import-jdl': stub });
            });
            before(() => {
                response = {
                    statusCode: 200,
                    pipe: fileStream => {
                        fileStream.close();
                    },
                };
            });

            it('should call import-jdl', done => {
                events.once('importJdl', () => {
                    expect(stub.getCall(0).args[0]).to.be.eql(['foo.jh']);
                    done();
                });
                sample(['foo.jh']);
            });

            it('should forward options', done => {
                events.once('importJdl', () => {
                    expect(stub.getCall(0).args[1].foo).to.be.equal(true);
                    done();
                });
                sample(['foo.jh'], { foo: true });
            });

            it('should forward environment', done => {
                const env = { env: true };
                events.once('importJdl', () => {
                    expect(stub.getCall(0).args[2]).to.be.equal(env);
                    done();
                });
                sample(['foo.jh'], { foo: true }, env);
            });
        });
    });
});

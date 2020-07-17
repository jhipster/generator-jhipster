/* eslint-disable no-unused-expressions, no-console */

const expect = require('chai').expect;
const exec = require('child_process').exec;
const path = require('path');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');
const Environment = require('yeoman-environment');

const {
    getJHipsterCli,
    testInTempDir,
    prepareTempDir,
    revertTempDir,
    copyFakeBlueprint,
    copyBlueprint,
    lnYeoman,
} = require('../utils/utils');
const { logger } = require('../../cli/utils');

describe('jhipster cli test', () => {
    let cwd;
    before(() => {
        cwd = prepareTempDir();
    });
    after(() => revertTempDir(cwd));

    const cmd = getJHipsterCli();

    it('verify correct cmd format', () => {
        expect(cmd).to.match(/node (.*)\/cli\/jhipster/g);
    });

    it('--help should run without errors', done => {
        exec(`${cmd} --help`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('--version should run without errors', done => {
        exec(`${cmd} --version`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('should return error on unknown command', function (done) {
        this.timeout(10000);

        exec(`${cmd} junkcmd`, (error, stdout, stderr) => {
            expect(error).to.not.be.null;
            expect(error.code).to.equal(1);
            expect(stderr.includes('is not a known command')).to.be.true;
            done();
        });
    });

    describe('with an unknown command', () => {
        let oldArgv;
        before(() => {
            oldArgv = process.argv;
            process.argv = ['jhipster', 'jhipster', 'entitt'];
            sinon.stub(logger, 'fatal');
            sinon.stub(logger, 'info');
        });
        after(() => {
            process.argv = oldArgv;
            logger.fatal.restore();
            logger.info.restore();
        });
        it('should print did you mean message', () => {
            proxyquire('../../cli/cli', {});
            expect(logger.info.getCall(0).args[0]).to.include('Did you mean');
            expect(logger.info.getCall(0).args[0]).to.include('entity');
        });

        it('should print error message', () => {
            proxyquire('../../cli/cli', {});
            expect(logger.fatal.getCall(0).args[0]).to.include('entitt');
            expect(logger.fatal.getCall(0).args[0]).to.include('is not a known command');
        });
    });

    describe('with mocked generator command', () => {
        const commands = { mocked: {} };
        let oldArgv;
        let callback;
        before(() => {
            oldArgv = process.argv;
        });
        after(() => {
            process.argv = oldArgv;
        });
        beforeEach(() => {
            commands.mocked = { desc: 'Mocked command' };
            sinon.stub(Environment.prototype, 'run').callsFake((...args) => {
                callback(...args);
                return Promise.resolve();
            });
            sinon.stub(Environment.prototype, 'create').returns({ _options: {} });
        });
        afterEach(() => {
            Environment.prototype.run.restore();
            Environment.prototype.create.restore();
        });

        const commonTests = () => {
            it('should pass a truthy fromCli', done => {
                callback = (_command, options) => {
                    expect(options.fromCli).to.be.true;
                    expect(options['fromCli']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands });
            });
            it('should pass a defined command', done => {
                callback = (command, _options) => {
                    expect(command).to.not.be.undefined;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands });
            });
        };

        describe('without argument', () => {
            beforeEach(() => {
                process.argv = ['jhipster', 'jhipster', 'mocked', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward options', done => {
                callback = (command, options) => {
                    expect(command).to.be.equal('jhipster:mocked');
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands });
            });
        });

        describe('with argument', () => {
            beforeEach(() => {
                commands.mocked.argument = ['name'];
                process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                callback = (command, options) => {
                    expect(command).to.be.equal('jhipster:mocked Foo');
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands });
            });
        });

        describe('with variable arguments', () => {
            beforeEach(() => {
                commands.mocked.argument = ['name...'];
                process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', 'Bar', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                callback = (command, options) => {
                    expect(command).to.be.equal('jhipster:mocked Foo Bar');
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands });
            });
        });
    });

    describe('with mocked cliOnly commands', () => {
        let oldArgv;
        const commands = { mocked: {} };
        before(() => {
            oldArgv = process.argv;
        });
        after(() => {
            process.argv = oldArgv;
        });
        beforeEach(() => {
            commands.mocked = { cb: () => {} };
        });

        const commonTests = () => {
            it('should pass a truthy fromCli', done => {
                const cb = (_args, options, _env) => {
                    expect(options.fromCli).to.be.true;
                    expect(options['fromCli']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
            it('should pass a defined environment', done => {
                const cb = (_args, _options, env) => {
                    expect(env).to.not.be.undefined;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        };

        describe('with argument', () => {
            beforeEach(() => {
                commands.mocked.desc = 'Mocked command';
                commands.mocked.argument = ['name'];
                commands.mocked.cliOnly = true;
                process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                const cb = (args, options) => {
                    expect(args).to.eql(['Foo']);
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        });

        describe('with variable arguments', () => {
            beforeEach(() => {
                commands.mocked.desc = 'Mocked command';
                commands.mocked.argument = ['name...'];
                commands.mocked.cliOnly = true;
                process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', 'Bar', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                const cb = (args, options, env) => {
                    expect(args).to.eql(['Foo', 'Bar']);
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        });

        describe('without argument', () => {
            beforeEach(() => {
                commands.mocked.desc = 'Mocked command';
                commands.mocked.cliOnly = true;
                process.argv = ['jhipster', 'jhipster', 'mocked', '--foo', '--foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                const cb = (args, options, env) => {
                    expect(args).to.eql([]);
                    expect(options.foo).to.be.true;
                    expect(options.fooBar).to.be.true;
                    expect(options['foo-bar']).to.be.true;
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        });
    });

    it('should delegate to blueprint on blueprint command but will not find it', function (done) {
        this.timeout(10000);

        testInTempDir(tmpdir => {
            copyFakeBlueprint(tmpdir, 'bar');
            exec(`${cmd} foo --blueprint bar`, (error, stdout, stderr) => {
                expect(error).to.not.be.null;
                expect(error.code).to.equal(1);
                /* eslint-disable prettier/prettier */
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                expect(stderr.includes('foo is not a known command')).to.be.true;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command but will not find it', function (done) {
        this.timeout(10000);

        testInTempDir(tmpdir => {
            copyFakeBlueprint(tmpdir, 'bar', 'baz');
            exec(`${cmd} foo --blueprints bar,baz`, (error, stdout, stderr) => {
                expect(error).to.not.be.null;
                expect(error.code).to.equal(1);
                /* eslint-disable prettier/prettier */
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-baz')).to.be.true;
                expect(stderr.includes('foo is not a known command')).to.be.true;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command with sharedOptions and find it', function (done) {
        this.timeout(10000);

        testInTempDir(tmpdir => {
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
            lnYeoman(tmpdir);
            exec(`${cmd} foo --blueprints cli`, (error, stdout, stderr) => {
                expect(stdout.includes('Running foo')).to.be.true;
                expect(stdout.includes('Running bar')).to.be.true;
                expect(stdout.includes('barValue')).to.be.true;
                expect(stdout.includes('foorValue')).to.be.false;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command with multiple sharedOptions and find it', function (done) {
        this.timeout(10000);

        testInTempDir(tmpdir => {
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli-shared'), tmpdir, 'cli-shared');
            lnYeoman(tmpdir);
            exec(`${cmd} foo --blueprints cli,cli-shared`, (error, stdout, stderr) => {
                expect(stdout.includes('Running foo')).to.be.true;
                expect(stdout.includes('Running bar')).to.be.true;
                expect(stdout.includes('fooValue')).to.be.true;
                expect(stdout.includes('barValue')).to.be.true;
                done();
            });
        });
    });
});

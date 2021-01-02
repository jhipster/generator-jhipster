/* eslint-disable no-unused-expressions, no-console */

const expect = require('chai').expect;
const { exec, fork } = require('child_process');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const sinon = require('sinon');
const Environment = require('yeoman-environment');

const { getJHipsterCli, prepareTempDir, copyFakeBlueprint, copyBlueprint, lnYeoman } = require('../utils/utils');
const { logger } = require('../../cli/utils');

const jhipsterCli = require.resolve(path.join(__dirname, '..', '..', 'cli', 'cli.js'));

describe('jhipster cli', () => {
    let cleanup;
    beforeEach(() => {
        cleanup = prepareTempDir();
    });
    afterEach(() => cleanup());

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
                    expect(options.fromCli).to.be.true;
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
                    expect(options.fromCli).to.be.true;
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
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        });

        describe('with negate argument', () => {
            beforeEach(() => {
                commands.mocked.desc = 'Mocked command';
                commands.mocked.argument = ['name'];
                commands.mocked.cliOnly = true;
                process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--no-foo', '--no-foo-bar'];
            });

            commonTests();

            it('should forward argument and options', done => {
                const cb = (args, options) => {
                    expect(args).to.eql(['Foo']);
                    expect(options.foo).to.be.false;
                    expect(options.fooBar).to.be.false;
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
                    done();
                };
                proxyquire('../../cli/cli', { './commands': commands, './mocked': cb });
            });
        });
    });

    describe('when executing with blueprints', () => {
        describe('delegating commands', () => {
            describe('to blueprint without commands', () => {
                let cbArgs;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyFakeBlueprint(tmpdir, 'bar');
                    exec(`${cmd} foo --blueprints bar`, (...args) => {
                        cbArgs = args;
                        done();
                    });
                });

                it('should execute callback with error', () => {
                    expect(cbArgs[0]).to.not.be.null;
                    expect(cbArgs[0].code).to.equal(1);
                });
                it('should print warnings', () => {
                    /* eslint-disable prettier/prettier */
                    expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                    expect(cbArgs[2].includes('foo is not a known command')).to.be.true;
                });
            });

            describe('to multiple blueprints without commands', () => {
                let cbArgs;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyFakeBlueprint(tmpdir, 'bar', 'baz');
                    exec(`${cmd} foo --blueprints bar,baz`, (...args) => {
                        cbArgs = args;
                        done();
                    });
                });

                it('should execute callback with error', () => {
                    expect(cbArgs[0]).to.not.be.null;
                    expect(cbArgs[0].code).to.equal(1);
                });
                it('should print warnings', () => {
                    /* eslint-disable prettier/prettier */
                    expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                    expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-baz')).to.be.true;
                    expect(cbArgs[2].includes('foo is not a known command')).to.be.true;
                });
            });
        });

        describe('loading sharedOptions', () => {
            describe('using blueprint with sharedOptions', () => {
                let stdout;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
                    lnYeoman(tmpdir);
                    const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe', cwd: tmpdir });
                    forked.on('exit', () => {
                        stdout = forked.stdout.read().toString();
                        done();
                    });
                });

                it('should print sharedOptions info', () => {
                    expect(stdout.includes('Running foo')).to.be.true;
                    expect(stdout.includes('Running bar')).to.be.true;
                    expect(stdout.includes('barValue')).to.be.true;
                    expect(stdout.includes('fooValue')).to.be.false;
                });
            });

            describe('using multiple blueprints with sharedOptions', () => {
                let stdout;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
                    copyBlueprint(path.join(__dirname, '../templates/blueprint-cli-shared'), tmpdir, 'cli-shared');
                    lnYeoman(tmpdir);
                    const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe', cwd: tmpdir });
                    forked.on('exit', () => {
                        stdout = forked.stdout.read().toString();
                        done();
                    });
                });

                it('should print sharedOptions info', () => {
                    expect(stdout.includes('Running foo')).to.be.true;
                    expect(stdout.includes('Running bar')).to.be.true;
                    expect(stdout.includes('barValue')).to.be.true;
                    expect(stdout.includes('fooValue')).to.be.false;
                });
            });
        });
        describe('loading options', () => {
            describe('using blueprint with cli option', () => {
                let stdout;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
                    lnYeoman(tmpdir);
                    const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli', '--help'], { stdio: 'pipe' });
                    forked.on('exit', () => {
                        stdout = forked.stdout.read().toString();
                        done();
                    });
                });

                it('should print foo options', () => {
                    expect(stdout.includes('--foo')).to.be.true;
                    expect(stdout.includes('foo description (blueprint option: generator-jhipster-cli)')).to.be.true;
                });
            });

            describe('using blueprint with generator option', () => {
                let stdout;
                beforeEach(done => {
                    const tmpdir = process.cwd();
                    copyBlueprint(path.join(__dirname, '../templates/blueprint-cli-shared'), tmpdir, 'cli-shared');
                    lnYeoman(tmpdir);
                    const forked = fork(jhipsterCli, ['bar', '--blueprints', 'cli-shared', '--help'], { stdio: 'pipe', cwd: tmpdir });
                    forked.on('exit', () => {
                        stdout = forked.stdout.read().toString();
                        done();
                    });
                });

                it('should print bar command help', () => {
                    expect(stdout.includes('Create a new bar. (blueprint: generator-jhipster-cli-shared)')).to.be.true;
                });
                it('should print foo option', () => {
                    expect(stdout.includes('--foo')).to.be.true;
                    expect(stdout.includes('foo description')).to.be.true;
                });
            });
        });
    });
});

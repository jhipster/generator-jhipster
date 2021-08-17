/* eslint-disable no-unused-expressions, no-console */

const assert = require('assert');
const expect = require('chai').expect;
const { exec, fork } = require('child_process');
const path = require('path');
const sinon = require('sinon');
const Environment = require('yeoman-environment');

const { createProgram, buildJHipster } = require('../../cli/program');
const { getJHipsterCli, prepareTempDir, copyFakeBlueprint, copyBlueprint, lnYeoman } = require('../utils/utils');
const { logger } = require('../../cli/utils');

const jhipsterCli = require.resolve(path.join(__dirname, '..', '..', 'cli', 'cli.js'));

const mockCli = (opts = {}) => {
  opts = { ...opts, program: createProgram() };
  opts.loadCommand = key => opts[`./${key}`];
  const program = buildJHipster(opts);
  const { argv } = opts;
  return program.parseAsync(argv);
};

describe('jhipster cli', () => {
  let cleanup;
  let sandbox;
  beforeEach(() => {
    cleanup = prepareTempDir();
    sandbox = sinon.createSandbox();

    sandbox.stub(logger, 'fatal').callsFake(message => {
      throw new Error(message);
    });
    sandbox.stub(logger, 'info');
  });
  afterEach(() => cleanup());
  afterEach(() => sandbox.restore());

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
    it('should print did you mean message', async () => {
      try {
        await mockCli({ argv: ['jhipster', 'jhipster', 'entitt'] });
        assert.fail();
      } catch (error) {
        expect(logger.info.getCall(0).args[0]).to.include('Did you mean');
        expect(logger.info.getCall(0).args[0]).to.include('entity');
      }
    });

    it('should print error message', async () => {
      try {
        await mockCli({ argv: ['jhipster', 'jhipster', 'entitt'] });
        assert.fail();
      } catch (error) {
        expect(logger.fatal.getCall(0).args[0]).to.include('entitt');
        expect(logger.fatal.getCall(0).args[0]).to.include('is not a known command');
      }
    });
  });

  describe('with mocked generator command', () => {
    const commands = { mocked: {} };
    const generator = { mocked: {} };
    let oldArgv;
    let callback;
    before(() => {
      oldArgv = process.argv;
    });
    after(() => {
      process.argv = oldArgv;
    });
    beforeEach(() => {
      generator.mocked = {
        _options: {
          foo: {
            description: 'Foo',
          },
          'foo-bar': {
            description: 'Foo bar',
          },
        },
        sourceRoot: () => '',
      };
      sandbox.stub(Environment.prototype, 'run').callsFake((...args) => {
        callback(...args);
        return Promise.resolve();
      });
      sandbox.stub(Environment.prototype, 'composeWith');
      sandbox.stub(Environment.prototype, 'create').returns(generator.mocked);
    });

    const commonTests = () => {
      it('should pass a defined command', done => {
        callback = (command, _options) => {
          expect(command).to.not.be.undefined;
          done();
        };
        return mockCli({ commands });
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
        return mockCli({ commands });
      });
    });

    describe('with argument', () => {
      beforeEach(() => {
        generator.mocked._arguments = [{ name: 'name' }];
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
        return mockCli({ commands });
      });
    });

    describe('with variable arguments', () => {
      beforeEach(() => {
        generator.mocked._arguments = [{ name: 'name', type: Array }];
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
        return mockCli({ commands });
      });
    });
  });

  describe('with mocked cliOnly commands', () => {
    let oldArgv;
    const commands = {
      mocked: {},
    };
    before(() => {
      oldArgv = process.argv;
    });
    after(() => {
      process.argv = oldArgv;
    });
    beforeEach(() => {
      commands.mocked = {
        cb: () => {},
        options: [
          {
            option: '--foo',
            desc: 'Foo',
          },
          {
            option: '--no-foo',
            desc: 'No foo',
          },
          {
            option: '--foo-bar',
            desc: 'Foo bar',
          },
          {
            option: '--no-foo-bar',
            desc: 'No foo bar',
          },
        ],
      };
    });

    const commonTests = () => {
      it('should pass a defined environment', done => {
        const cb = (_args, _options, env) => {
          expect(env).to.not.be.undefined;
          done();
        };
        return mockCli({ commands, './mocked': cb });
      });
    };

    describe('with argument', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name>'];
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
        return mockCli({ commands, './mocked': cb });
      });
    });

    describe('with negate argument', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name>'];
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
        return mockCli({ commands, './mocked': cb });
      });
    });

    describe('with variable arguments', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name...>'];
        commands.mocked.cliOnly = true;
        process.argv = ['jhipster', 'jhipster', 'mocked', 'Foo', 'Bar', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', done => {
        const cb = (args, options, env) => {
          expect(args).to.eql([['Foo', 'Bar']]);
          expect(options.foo).to.be.true;
          expect(options.fooBar).to.be.true;
          done();
        };
        return mockCli({ commands, './mocked': cb });
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
        return mockCli({ commands, './mocked': cb });
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

        it('should print foo command', () => {
          expect(stdout.includes('Create a new foo. (blueprint: generator-jhipster-cli)')).to.be.true;
        });

        it('should print foo options', () => {
          expect(stdout.includes('--foo')).to.be.true;
        });
      });

      describe('using blueprint with custom generator option', () => {
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

      describe('using blueprint with blueprinted generator option', () => {
        let stdout;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyFakeBlueprint(tmpdir, 'bar');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['app', '--blueprints', 'bar', '--help'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', () => {
            stdout = forked.stdout.read().toString();
            done();
          });
        });

        it('should print foo-bar option', () => {
          expect(stdout).to.include('--foo-bar');
          expect(stdout).to.include('Sample option (blueprint option: bar)');
        });
      });
    });
  });

  describe('jhipster run', () => {
    describe('running jhipster built-in generators', () => {
      describe('jhipster:app', () => {
        let stdout;
        let exitCode;
        before(done => {
          const forked = fork(jhipsterCli, ['run', 'jhipster:app', '--help'], { stdio: 'pipe' });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout.read().toString();
            done();
          });
        });

        it('should print usage', () => {
          expect(stdout.includes('Usage: cli run jhipster:app [options]')).to.be.true;
        });
        it('should print options', () => {
          expect(stdout.includes('--application-type <value>')).to.be.true;
        });
        it('should exit with code 0', () => {
          expect(exitCode).to.equal(0);
        });
      });
    });
    describe('custom generator', () => {
      describe('--help', () => {
        let stdout;
        let exitCode;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--help'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout.read().toString();
            done();
          });
        });

        it('should print usage', () => {
          expect(stdout.includes('Usage: cli run cli:foo [options]')).to.be.true;
        });
        it('should print options', () => {
          expect(stdout.includes('--foo-bar')).to.be.true;
          expect(stdout.includes('Sample option')).to.be.true;
        });
        it('should exit with code 0', () => {
          expect(exitCode).to.equal(0);
        });
      });
      describe('running it', () => {
        let stdout;
        let exitCode;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--foo-bar'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout.read().toString();
            done();
          });
        });

        it('should print runtime log', () => {
          expect(stdout.includes('Running foo')).to.be.true;
          expect(stdout.includes('Running bar')).to.be.true;
        });
        it('should exit with code 0', () => {
          expect(exitCode).to.equal(0);
        });
      });
    });
    describe('non existing generator', () => {
      describe('--help', () => {
        let stderr;
        let exitCode;
        before(done => {
          const tmpdir = process.cwd();
          const forked = fork(jhipsterCli, ['run', 'non-existing', '--help'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', code => {
            exitCode = code;
            stderr = forked.stderr.read().toString();
            done();
          });
        });

        it('should print error', () => {
          expect(stderr.includes('Generator jhipster-non-existing not found.')).to.be.true;
        });
        it('should exit with code 1', () => {
          expect(exitCode).to.equal(1);
        });
      });
    });
  });
});

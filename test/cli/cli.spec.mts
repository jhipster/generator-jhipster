/* eslint-disable no-unused-expressions, no-console */
import assert from 'assert';
import { jestExpect as expect } from 'mocha-expect-snapshot';
import { exec, fork } from 'child_process';
import Environment from 'yeoman-environment';
import helpers from 'yeoman-test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mock, resetAllMocks, fn } from '@node-loaders/jest-mock';

import { getCommand as actualGetCommonand } from '../../cli/utils.mjs';
import { createProgram } from '../../cli/program.mjs';
import { getJHipsterCli, prepareTempDir, copyFakeBlueprint, copyBlueprint, lnYeoman } from './utils/utils.cjs';
import { getTemplatePath } from '../support/index.mjs';

const { logger, getCommand } = await mock<typeof import('../../cli/utils.mjs')>('../../cli/utils.mjs');
const { buildJHipster } = await import('../../cli/program.mjs');

const jhipsterCli = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist', 'cli', 'cli.mjs');

const mockCli = async (argv: string[], opts = {}) => {
  const program = await buildJHipster({ printLogo: () => {}, ...opts, program: createProgram(), loadCommand: key => opts[`./${key}`] });
  return program.parseAsync(argv);
};

describe('jhipster cli', () => {
  let argv;
  let cleanup;
  beforeEach(() => {
    cleanup = prepareTempDir();
  });
  afterEach(() => {
    argv = undefined;
    resetAllMocks();
  });
  afterEach(() => cleanup());

  const cmd = getJHipsterCli();

  it('verify correct cmd format', () => {
    expect(cmd).toMatch(/node (.*)\/cli\/jhipster/g);
  });

  it('--help should run without errors', done => {
    exec(`${cmd} --help`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      done();
    });
  });

  it('--version should run without errors', done => {
    exec(`${cmd} --version`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      done();
    });
  });

  it('should return error on unknown command', function (done) {
    exec(`${cmd} junkcmd`, (error, stdout, stderr) => {
      expect(error).not.toBeNull();
      expect(error?.code).toBe(1);
      expect(stderr).toMatch('is not a known command');
      done();
    });
  });

  describe('with an unknown command', () => {
    it('should print did you mean message', async () => {
      try {
        await mockCli(['jhipster', 'jhipster', 'entitt']);
        assert.fail();
      } catch (error) {
        expect(logger.info).toHaveBeenCalledWith(expect.stringMatching('Did you mean'));
        expect(logger.info).toHaveBeenCalledWith(expect.stringMatching('entity'));
      }
    });

    it('should print error message', async () => {
      try {
        await mockCli(['jhipster', 'jhipster', 'entitt']);
        assert.fail();
      } catch (error) {
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringMatching('entitt'));
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringMatching('is not a known command'));
      }
    });
  });

  describe('with mocked generator command', () => {
    const commands = { mocked: {} };
    let generator;
    let runArgs;
    let env: Environment;

    beforeEach(async () => {
      getCommand.mockImplementation(actualGetCommonand);

      const BaseGenerator = (await import('../../generators/base/index.mjs')).default;
      env = Environment.createEnv();
      generator = new (helpers.createDummyGenerator(BaseGenerator))({ env, namespace: 'jhipster:foo' });
      generator._options = {
        foo: {
          description: 'Foo',
        },
        'foo-bar': {
          description: 'Foo bar',
        },
      };
      env.run = fn<typeof env.run>((...args) => {
        runArgs = args;
        return Promise.resolve();
      });
      env.composeWith = fn<typeof env.composeWith>();
      env.create = fn<typeof env.create>().mockReturnValue(generator) as any;
    });

    const commonTests = () => {
      it('should pass a defined command', async () => {
        await mockCli(argv, { commands, env });
        const [command] = runArgs;
        expect(command).toBeDefined();
      });
    };

    describe('without argument', () => {
      beforeEach(() => {
        argv = ['jhipster', 'jhipster', 'mocked', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward options', async () => {
        await mockCli(argv, { commands, env });
        const [command, options] = runArgs;
        expect(command).toEqual('jhipster:mocked');
        expect(options.foo).toBe(true);
        expect(options.fooBar).toBe(true);
      });
    });

    describe('with argument', () => {
      beforeEach(() => {
        generator._arguments = [{ name: 'name' }];
        argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        await mockCli(argv, { commands, env });
        const [command, options] = runArgs;
        expect(command).toEqual('jhipster:mocked Foo');
        expect(options.foo).toBe(true);
        expect(options.fooBar).toBe(true);
      });
    });

    describe('with variable arguments', () => {
      beforeEach(() => {
        generator._arguments = [{ name: 'name', type: Array }];
        argv = ['jhipster', 'jhipster', 'mocked', 'Foo', 'Bar', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        await mockCli(argv, { commands, env });
        const [command, options] = runArgs;
        expect(command).toEqual('jhipster:mocked Foo Bar');
        expect(options.foo).toBe(true);
        expect(options.fooBar).toBe(true);
        return mockCli(argv, { commands, env });
      });
    });
  });

  describe('with mocked cliOnly commands', () => {
    const commands = {
      mocked: {},
    } as { mocked: any };
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
      it('should pass a defined environment', async () => {
        return mockCli(argv, { commands });
      });
    };

    describe('with argument', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name>'];
        commands.mocked.cliOnly = true;
        argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        const cb = (args, options) => {
          expect(args).toEqual(['Foo']);
          expect(options.foo).toBe(true);
          expect(options.fooBar).toBe(true);
        };
        await mockCli(argv, { commands, './mocked': cb });
      });
    });

    describe('with negate argument', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name>'];
        commands.mocked.cliOnly = true;
        argv = ['jhipster', 'jhipster', 'mocked', 'Foo', '--no-foo', '--no-foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        const cb = (args, options) => {
          expect(args).toEqual(['Foo']);
          expect(options.foo).toBe(false);
          expect(options.fooBar).toBe(false);
        };
        await mockCli(argv, { commands, './mocked': cb });
      });
    });

    describe('with variable arguments', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.argument = ['<name...>'];
        commands.mocked.cliOnly = true;
        argv = ['jhipster', 'jhipster', 'mocked', 'Foo', 'Bar', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        const cb = (args, options, env) => {
          expect(args).toEqual([['Foo', 'Bar']]);
          expect(options.foo).toBe(true);
          expect(options.fooBar).toBe(true);
        };
        await mockCli(argv, { commands, './mocked': cb });
      });
    });

    describe('without argument', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.cliOnly = true;
        argv = ['jhipster', 'jhipster', 'mocked', '--foo', '--foo-bar'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        const cb = (args, options, env) => {
          expect(args).toEqual([]);
          expect(options.foo).toBe(true);
          expect(options.fooBar).toBe(true);
        };
        return mockCli(argv, { commands, './mocked': cb });
      });
    });

    describe('with useOptions', () => {
      beforeEach(() => {
        commands.mocked.desc = 'Mocked command';
        commands.mocked.cliOnly = true;
        commands.mocked.useOptions = { useFoo: true, useBar: 'foo' };
        argv = ['jhipster', 'jhipster', 'mocked'];
      });

      commonTests();

      it('should forward argument and options', async () => {
        const cb = (args, options) => {
          expect(options.useFoo).toBe(true);
          expect(options.useBar).toBe('foo');
        };
        await mockCli(argv, { commands, './mocked': cb });
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
          expect(cbArgs[0]).not.toBeNull();
          expect(cbArgs[0].code).toBe(1);
        });
        it('should print warnings', () => {
          /* eslint-disable prettier/prettier */
          expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-bar')).toBe(true);
          expect(cbArgs[2].includes('foo is not a known command')).toBe(true);
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
          expect(cbArgs[0]).not.toBeNull();
          expect(cbArgs[0].code).toBe(1);
        });
        it('should print warnings', () => {
          /* eslint-disable prettier/prettier */
          expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-bar')).toBe(true);
          expect(cbArgs[1].includes('No custom commands found within blueprint: generator-jhipster-baz')).toBe(true);
          expect(cbArgs[2].includes('foo is not a known command')).toBe(true);
        });
      });
    });

    describe('loading sharedOptions', () => {
      describe('using blueprint with sharedOptions', () => {
        let stdout;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', () => {
            stdout = forked.stdout!.read().toString();
            done();
          });
        });

        it('should print sharedOptions info', () => {
          expect(stdout).toMatch('Running foo');
          expect(stdout.includes('Running bar')).toBe(true);
          expect(stdout.includes('barValue')).toBe(true);
          expect(stdout.includes('fooValue')).toBe(false);
        });
      });

      describe('using multiple blueprints with sharedOptions', () => {
        let stdout;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          copyBlueprint(getTemplatePath('cli/blueprint-cli-shared'), tmpdir, 'cli-shared');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print sharedOptions info', () => {
          expect(stdout.includes('Running foo')).toBe(true);
          expect(stdout.includes('Running bar')).toBe(true);
          expect(stdout.includes('barValue')).toBe(true);
          expect(stdout.includes('fooValue')).toBe(false);
        });
      });
    });
    describe('loading options', () => {
      describe('using blueprint with cli option', () => {
        let stdout;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli', '--help'], { stdio: 'pipe' });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print foo command', () => {
          expect(stdout.includes('Create a new foo. (blueprint: generator-jhipster-cli)')).toBe(true);
        });

        it('should print foo options', () => {
          expect(stdout.includes('--foo')).toBe(true);
        });
      });

      describe('using blueprint with custom generator option', () => {
        let stdout;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli-shared'), tmpdir, 'cli-shared');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['bar', '--blueprints', 'cli-shared', '--help'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print bar command help', () => {
          expect(stdout.includes('Create a new bar. (blueprint: generator-jhipster-cli-shared)')).toBe(true);
        });
        it('should print foo option', () => {
          expect(stdout.includes('--foo')).toBe(true);
          expect(stdout.includes('foo description')).toBe(true);
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
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print foo-bar option', () => {
          expect(stdout).toMatch('--foo-bar');
          expect(stdout).toMatch('Sample option (blueprint option: bar)');
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
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print usage', () => {
          expect(stdout).toMatch('Usage: jhipster run jhipster:app [options]');
        });
        it('should print options', () => {
          expect(stdout).toMatch('--application-type <value>');
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
        });
      });
    });
    describe('custom generator', () => {
      describe('--help', () => {
        let stdout;
        let exitCode;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--help'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print usage', () => {
          expect(stdout.includes('Usage: jhipster run cli:foo [options]')).toBe(true);
        });
        it('should print options', () => {
          expect(stdout.includes('--foo-bar')).toBe(true);
          expect(stdout.includes('Sample option')).toBe(true);
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
        });
      });
      describe('running it', () => {
        let stdout;
        let exitCode;
        beforeEach(done => {
          const tmpdir = process.cwd();
          copyBlueprint(getTemplatePath('cli/blueprint-cli'), tmpdir, 'cli');
          lnYeoman(tmpdir);
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--foo-bar'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print runtime log', () => {
          expect(stdout.includes('Running foo')).toBe(true);
          expect(stdout.includes('Running bar')).toBe(true);
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
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
            stderr = forked.stderr?.read().toString();
            done();
          });
        });

        it('should print error', () => {
          expect(stderr.includes('Generator jhipster-non-existing not found.')).toBe(true);
        });
        it('should exit with code 1', () => {
          expect(exitCode).toBe(1);
        });
      });
    });
  });
});

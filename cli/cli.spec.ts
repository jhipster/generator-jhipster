import { after, before, describe, esmocha, expect, it, resetAllMocks } from 'esmocha';
import assert from 'node:assert';
import { fork } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GeneratorMeta } from '@yeoman/types';
import { execaCommandSync } from 'execa';
import { coerce } from 'semver';
import type FullEnvironment from 'yeoman-environment';

import { createBlueprintFiles, defaultHelpers as helpers } from '../lib/testing/index.ts';

import type JHipsterCommand from './jhipster-command.js';
import { createProgram } from './program.ts';
import type { CliCommand } from './types.ts';
import { getCommand as actualGetCommand } from './utils.ts';

const cliBlueprintFiles = {
  'cli/commands.js': `export default {
  foo: {
    blueprint: 'generator-jhipster-cli',
    desc: 'Create a new foo.',
    options: [
      {
        option: '--foo',
        description: 'foo description',
      },
    ],
  },
};
`,
  'cli/sharedOptions.js': `export default {
  fooBar: 'barValue',
};
`,
  'generators/foo/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    constructor(args, opts, features) {
      super(args, opts, features);

      this.option('foo-bar', {
        description: 'Sample option',
        type: Boolean,
      });
    }

    get [BaseGenerator.INITIALIZING]() {
      /* eslint-disable no-console */
      console.log('Running foo');
      if (this.options.fooBar) {
        /* eslint-disable no-console */
        console.log('Running bar');
        console.log(this.options.fooBar);
      }
    }
  };
};
`,
};

const cliSharedBlueprintFiles = {
  'cli/commands.js': `export default {
  bar: {
    blueprint: 'generator-jhipster-cli-shared',
    desc: 'Create a new bar.',
  },
};
`,
  'cli/sharedOptions.js': `export default {
  fooBar: 'fooValue',
  single: true,
};
`,
  'generators/bar/index.js': `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {
    constructor(args, options) {
      super(args, options);
      this.option('foo', {
        description: 'foo description',
        type: Boolean,
      });
    }
    get [BaseGenerator.INITIALIZING]() {}
  };
};
`,
};

describe('cli', () => {
  const __filename = fileURLToPath(import.meta.url);
  const jhipsterCli = join(dirname(__filename), '..', 'bin', 'jhipster.cjs');
  const logger = { verboseInfo: esmocha.fn(), warn: esmocha.fn(), fatal: esmocha.fn(), debug: esmocha.fn() };
  const getCommand = esmocha.fn();
  let mockCli: (argv: string[], opts?: Record<string, any>) => Promise<JHipsterCommand>;
  let argv: string[];

  before(async () => {
    await esmocha.mock('./utils.ts', { logger, getCommand, CLI_NAME: 'jhipster', done: () => {} } as any);
    const { buildJHipster } = await import('./program.ts');

    mockCli = async (argv: string[], opts = {}) => {
      const program = await buildJHipster({
        printLogo: () => {},
        ...opts,
        program: createProgram(),
        loadCommand: (key: string) => opts[`./${key}`],
      });
      return program.parseAsync(argv);
    };
  });
  after(() => {
    esmocha.reset();
  });

  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });
  afterEach(() => {
    argv = [];
    resetAllMocks();
  });

  it('--help should run without errors', () => {
    const { stdout } = execaCommandSync(`${jhipsterCli} --help`);
    expect(stdout).toMatch(/For more info visit/);
  });

  it('--version should run without errors', () => {
    const { stdout } = execaCommandSync(`${jhipsterCli} --version`);
    expect(coerce(stdout)).toBeTruthy();
  });

  it('should return error on unknown command', () => {
    expect(() => execaCommandSync(`${jhipsterCli} junkcmd`)).toThrow(
      expect.objectContaining({
        exitCode: 1,
        message: expect.stringContaining('is not a known command'),
        stderr: expect.stringContaining('is not a known command'),
      }),
    );
  });

  describe('with an unknown command', () => {
    it('should print did you mean message', async () => {
      try {
        await mockCli(['jhipster', 'jhipster', 'entitt']);
        assert.fail();
      } catch {
        expect(logger.verboseInfo).toHaveBeenCalledWith(expect.stringMatching('Did you mean'));
        expect(logger.verboseInfo).toHaveBeenCalledWith(expect.stringMatching('entity'));
      }
    });

    it('should print error message', async () => {
      try {
        await mockCli(['jhipster', 'jhipster', 'entitt']);
        assert.fail();
      } catch {
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringMatching('entitt'));
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringMatching('is not a known command'));
      }
    });
  });

  describe('with mocked generator command', () => {
    const commands = { mocked: {} };
    let generator: any;
    let runArgs: any[];
    let env: FullEnvironment;

    beforeEach(async () => {
      getCommand.mockImplementation(actualGetCommand as any);

      const BaseGenerator = (await import('../generators/base/index.ts')).default;
      env = (await helpers.createTestEnv()) as FullEnvironment;
      // @ts-expect-error
      generator = new (helpers.createDummyGenerator(BaseGenerator))([], { env });
      generator._options = {
        foo: {
          description: 'Foo',
        },
        'foo-bar': {
          description: 'Foo bar',
        },
      };
      env.run = esmocha.fn<typeof env.run>((...args) => {
        runArgs = args;
        return Promise.resolve();
      });
      env.composeWith = esmocha.fn<typeof env.composeWith>() as any;
      const originalGetGeneratorMeta = env.getGeneratorMeta.bind(env);
      env.getGeneratorMeta = esmocha.fn((namespace: any): GeneratorMeta | undefined => {
        if (namespace === 'jhipster:mocked') {
          return {
            namespace,
            importModule: async () => ({}),
            resolved: __filename,
            instantiateHelp: () => generator,
            packageNamespace: undefined,
            importGenerator: undefined as any,
            instantiate: generator,
          };
        }
        return originalGetGeneratorMeta(namespace);
      });
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
    } as { mocked: CliCommand };
    beforeEach(() => {
      commands.mocked = {
        desc: 'Mocked command',
        options: [
          {
            option: '--foo',
            description: 'Foo',
          },
          {
            option: '--foo-bar',
            description: 'Foo bar',
          },
        ],
      };
    });

    const commonTests = () => {
      it('should pass a defined environment', async () => {
        return mockCli(argv, { commands, './mocked': () => {} });
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
        const cb = (args: string[], options: Record<string, any>) => {
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
        const cb = (args: string[], options: Record<string, any>) => {
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
        const cb = (args: string[], options: Record<string, any>) => {
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
        const cb = (args: string[], options: Record<string, any>) => {
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
        const cb = (args: string[], options: Record<string, any>) => {
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
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-bar', { generator: ['app', 'server'] }))
            .commitFiles();
        });

        it('should execute callback with error and print info', () => {
          expect(() => execaCommandSync(`${jhipsterCli} foo --blueprints bar`)).toThrow(
            expect.objectContaining({
              exitCode: 1,
              stdout: expect.stringContaining('No custom commands found within blueprint: generator-jhipster-bar'),
              stderr: expect.stringContaining('foo is not a known command'),
            }),
          );
        });
      });

      describe('to multiple blueprints without commands', () => {
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-bar'))
            .withFiles(createBlueprintFiles('generator-jhipster-baz'))
            .commitFiles();
        });

        it('should execute callback with error and print info', () => {
          expect(() => execaCommandSync(`${jhipsterCli} foo --blueprints bar,baz`)).toThrow(
            expect.objectContaining({
              exitCode: 1,
              stdout: expect.stringContaining('No custom commands found within blueprint: generator-jhipster-baz'),
              stderr: expect.stringContaining('foo is not a known command'),
            }),
          );
        });
      });
    });

    describe('loading sharedOptions', () => {
      describe('using blueprint with sharedOptions', () => {
        let stdout: string;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe' });
          forked.on('exit', () => {
            stdout = forked.stdout!.read().toString();
            done();
          });
        });

        it('should print sharedOptions info', () => {
          expect(stdout).toMatch('Running foo');
          expect(stdout).toMatch('Running bar');
          expect(stdout).toMatch('barValue');
          expect(stdout).not.toMatch('fooValue');
        });
      });

      describe('using multiple blueprints with sharedOptions', () => {
        let stdout: string;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
            .withFiles(createBlueprintFiles('generator-jhipster-cli-shared', { generator: 'foo', files: cliSharedBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const tmpdir = process.cwd();
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli'], { stdio: 'pipe', cwd: tmpdir });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print sharedOptions info', () => {
          expect(stdout).toMatch('Running foo');
          expect(stdout).toMatch('Running bar');
          expect(stdout).toMatch('barValue');
          expect(stdout).not.toMatch('fooValue');
        });
      });
    });
    describe('loading options', () => {
      describe('using blueprint with cli option', () => {
        let stdout: string;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['foo', '--blueprints', 'cli', '--help'], { stdio: 'pipe' });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print foo command', () => {
          expect(stdout).toMatch('Create a new foo. (blueprint: generator-jhipster-cli)');
        });

        it('should print foo options', () => {
          expect(stdout).toMatch('--foo');
        });
      });

      describe('using blueprint with custom generator option', () => {
        let stdout: string;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli-shared', { generator: 'foo', files: cliSharedBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['bar', '--blueprints', 'cli-shared', '--help'], { stdio: 'pipe' });
          forked.on('exit', () => {
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print bar command help', () => {
          expect(stdout).toMatch('Create a new bar. (blueprint: generator-jhipster-cli-shared)');
        });
        it('should print foo option', () => {
          expect(stdout).toMatch('--foo');
          expect(stdout).toMatch('foo description');
        });
      });

      describe('using blueprint with blueprinted generator option', () => {
        let stdout: string;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(
              createBlueprintFiles('generator-jhipster-bar', {
                generator: ['app'],
                generatorContent: `export const createGenerator = async env => {
    const BaseGenerator = await env.requireGenerator('jhipster:base');
    return class extends BaseGenerator {
      constructor(args, opts, features) {
        super(args, opts, features);

        this.option('foo-bar', {
          description: 'Sample option',
          type: Boolean,
        });
      }

      get [BaseGenerator.INITIALIZING]() {
        return {};
      }
    };
  };
  `,
              }),
            )
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['app', '--blueprints', 'bar', '--help'], { stdio: 'pipe' });
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
        let stdout: string;
        let exitCode: number | null;
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
          expect(stdout).toMatch('--defaults');
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
        });
      });
    });
    describe('custom generator', () => {
      describe('--help', () => {
        let stdout: string;
        let exitCode: number | null;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--help'], { stdio: 'pipe' });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print usage', () => {
          expect(stdout).toMatch('Usage: jhipster run cli:foo [options]');
        });
        it('should print options', () => {
          expect(stdout).toMatch('--foo-bar');
          expect(stdout).toMatch('Sample option');
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
        });
      });
      describe('running it', () => {
        let stdout: string;
        let exitCode: number | null;
        beforeEach(async () => {
          await helpers
            .prepareTemporaryDir()
            .withFiles(createBlueprintFiles('generator-jhipster-cli', { files: cliBlueprintFiles }))
            .commitFiles();
        });
        beforeEach(done => {
          const forked = fork(jhipsterCli, ['run', 'cli:foo', '--foo-bar'], { stdio: 'pipe' });
          forked.on('exit', code => {
            exitCode = code;
            stdout = forked.stdout?.read().toString();
            done();
          });
        });

        it('should print runtime log', () => {
          expect(stdout).toMatch('Running foo');
          expect(stdout).toMatch('Running bar');
        });
        it('should exit with code 0', () => {
          expect(exitCode).toBe(0);
        });
      });
    });
    describe('non existing generator', () => {
      describe('--help', () => {
        let stderr: string;
        let exitCode: number | null;
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

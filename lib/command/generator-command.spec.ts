import { describe, expect } from 'esmocha';

import type { GeneratorMeta } from '@yeoman/types';
import type FullEnvironment from 'yeoman-environment';

import BaseApplicationGenerator from '../../generators/base-application/generator.ts';
import { defaultHelpers as helpers, runResult } from '../testing/index.ts';

import type { JHipsterCommandDefinition, JHipsterConfig } from './types.ts';

const notImplementedCallback = (methodName: string) => {
  return () => {
    throw new Error(`${methodName} not implemented`);
  };
};

const dummyMeta = {
  packageNamespace: 'jhipster',
  resolved: 'dummy',
  importModule: () => Promise.resolve({ command: { loadGeneratorOptions: false } }),
  importGenerator: notImplementedCallback('importGenerator'),
  instantiateHelp: notImplementedCallback('instantiateHelp'),
  instantiate: notImplementedCallback('instantiate'),
};

class CommandGenerator extends BaseApplicationGenerator {
  constructor(args: any, opts: any, features: any) {
    super(args, opts, { ...features, jhipsterBootstrap: false });
    this.customLifecycle = true;
  }

  rootGeneratorName() {
    // Simulates a blueprint generator.
    return 'blueprint';
  }
}

const runDummyCli = (cliArgs: string, config: JHipsterConfig) => {
  return helpers
    .runCli(cliArgs.startsWith('jdl ') ? cliArgs : `dummy ${cliArgs}`.trim(), {
      prepareEnvironmentBuilder: false,
      entrypointGenerator: 'dummy',
      commands: {
        dummy: { desc: 'dummy Generator' },
      },
    })
    .withJHipsterConfig()
    .onEnvironment(env => {
      if (!config) {
        throw new Error('command not set');
      }

      const metaStore: Record<string, GeneratorMeta> = (env as FullEnvironment).getGeneratorsMeta();
      const generatorMeta = {
        ...dummyMeta,
        namespace: 'jhipster:dummy',
        importModule: () =>
          Promise.resolve({
            command: { configs: { testOption: config }, loadGeneratorOptions: false } satisfies JHipsterCommandDefinition,
          }),
        importGenerator: () => Promise.resolve(CommandGenerator as any),
      };
      (CommandGenerator as any)._meta = generatorMeta;
      metaStore['jhipster:dummy'] = generatorMeta;
      metaStore['jhipster:bootstrap'] = {
        ...dummyMeta,
        namespace: 'jhipster:bootstrap',
      };
    });
};

const expectGeneratorOptionsTestOption = () => expect((runResult.generator.options as any).testOption);
const expectGeneratorTestOption = () => expect((runResult.generator as any).testOption);
const expectContextTestOption = () => expect(runResult.generator.context!.testOption);
const expectJHipsterConfigTestOption = () => expect((runResult.generator.jhipsterConfig as any).testOption);
const expectBlueprintConfigTestOption = () => expect((runResult.generator as any).blueprintConfig.testOption);
const expectApplicationTestOption = () => expect(runResult.application?.testOption);

describe('generator commands', () => {
  for (const scope of ['generator', 'context', 'storage', 'blueprint', 'none'] as const) {
    describe(`${scope} scoped`, () => {
      const checkOptions = (
        value: any,
        { argument = false, expectUndefinedOption = false }: { argument?: boolean; expectUndefinedOption?: boolean } = {},
      ) => {
        if (expectUndefinedOption) {
          expectGeneratorOptionsTestOption().toBe(undefined);
        } else if (argument) {
          // Argument is passed through positionalArguments option.
          expectGeneratorOptionsTestOption().toBeUndefined();
        } else if (typeof value === 'number') {
          // Option value is not converted to number yet.
          expectGeneratorOptionsTestOption().toEqual(String(value));
        } else if (Array.isArray(value)) {
          expectGeneratorOptionsTestOption().toEqual(value);
        } else {
          expectGeneratorOptionsTestOption().toBe(value);
        }

        if (scope !== 'generator') {
          expectGeneratorTestOption().toBeUndefined();
        } else if (Array.isArray(value)) {
          expectGeneratorTestOption().toEqual(value);
        } else {
          expectGeneratorTestOption().toBe(value);
        }

        if (!['application', 'context', 'storage', 'blueprint'].includes(scope)) {
          expectContextTestOption().toBeUndefined();
        } else if (Array.isArray(value)) {
          expectContextTestOption().toEqual(value);
        } else {
          expectContextTestOption().toBe(value);
        }

        if (scope !== 'blueprint') {
          expectBlueprintConfigTestOption().toBeUndefined();
        } else if (Array.isArray(value)) {
          expectBlueprintConfigTestOption().toEqual(value);
        } else {
          expectBlueprintConfigTestOption().toBe(value);
        }

        if (!['application', 'context', 'storage', 'blueprint'].includes(scope)) {
          expectApplicationTestOption().toBeUndefined();
        } else if (Array.isArray(value)) {
          expectApplicationTestOption().toEqual(value);
        } else {
          expectApplicationTestOption().toBe(value);
        }

        // Storage scope is same as application scope with storage.
        if (scope !== 'storage') {
          expectJHipsterConfigTestOption().toBeUndefined();
        } else if (Array.isArray(value)) {
          expectJHipsterConfigTestOption().toEqual(value);
        } else {
          expectJHipsterConfigTestOption().toBe(value);
        }
      };

      describe('cli option', () => {
        describe('boolean', () => {
          const config: JHipsterConfig = {
            cli: {
              type: Boolean,
            },
            scope,
          };

          it('without options', async () => {
            await runDummyCli('', config);
            checkOptions(undefined);
          });
          it('with true option', async () => {
            await runDummyCli('--test-option', config);
            checkOptions(true);
          });
          it('with false option', async () => {
            await runDummyCli('--no-test-option', config);
            checkOptions(false);
          });
        });

        describe('string', () => {
          const config: JHipsterConfig = {
            cli: {
              type: String,
            },
            scope,
          };

          it('without options', async () => {
            await runDummyCli('', config);
            checkOptions(undefined);
          });
          it('with option value', async () => {
            await runDummyCli('--test-option 1', config);
            checkOptions('1');
          });
        });

        describe('number', () => {
          const config: JHipsterConfig = {
            cli: {
              type: Number,
            },
            scope,
          };

          it('without options', async () => {
            await runDummyCli('', config);
            checkOptions(undefined);
          });
          it('with option value', async () => {
            await runDummyCli('--test-option 1', config);
            checkOptions(1);
          });
        });

        describe('array', () => {
          const config: JHipsterConfig = {
            cli: {
              type: Array,
            },
            scope,
          };

          it('without options', async () => {
            await runDummyCli('', config);
            checkOptions(undefined);
          });
          it('with option value', async () => {
            await runDummyCli('--test-option 1', config);
            checkOptions(['1']);
          });
          it('with option values', async () => {
            await runDummyCli('--test-option 1 2', config);
            checkOptions(['1', '2']);
          });
        });
      });

      if (scope === 'generator') {
        describe('cli option with default value', () => {
          describe('boolean', () => {
            const config: JHipsterConfig = {
              cli: {
                type: Boolean,
              },
              default: true,
              scope,
            };

            it('without options', async () => {
              await runDummyCli('', config);
              checkOptions(true, { expectUndefinedOption: true });
            });
            it('with true option', async () => {
              await runDummyCli('--test-option', config);
              checkOptions(true);
            });
            it('with false option', async () => {
              await runDummyCli('--no-test-option', config);
              checkOptions(false);
            });
          });

          describe('string', () => {
            const config: JHipsterConfig = {
              cli: {
                type: String,
              },
              default: 'foo',
              scope,
            };

            it('without options', async () => {
              await runDummyCli('', config);
              checkOptions('foo', { expectUndefinedOption: true });
            });
            it('with option value', async () => {
              await runDummyCli('--test-option 1', config);
              checkOptions('1');
            });
          });

          describe('number', () => {
            const config: JHipsterConfig = {
              cli: {
                type: Number,
              },
              default: 1,
              scope,
            };

            it('without options', async () => {
              await runDummyCli('', config);
              checkOptions(1, { expectUndefinedOption: true });
            });
            it('with option value', async () => {
              await runDummyCli('--test-option 1', config);
              checkOptions(1);
            });
          });

          describe('array', () => {
            const config: JHipsterConfig = {
              cli: {
                type: Array,
              },
              default: ['1'],
              scope,
            };

            it('without options', async () => {
              await runDummyCli('', config);
              checkOptions(['1'], { expectUndefinedOption: true });
            });
            it('with option value', async () => {
              await runDummyCli('--test-option 1', config);
              checkOptions(['1']);
            });
            it('with option values', async () => {
              await runDummyCli('--test-option 1 2', config);
              checkOptions(['1', '2']);
            });
          });
        });
      }

      describe('cli argument', () => {
        describe('string', () => {
          const config: JHipsterConfig = {
            argument: {
              type: String,
            },
            scope,
          };

          it('without argument', async () => {
            await runDummyCli('', config);
            checkOptions(undefined, { argument: true });
          });
          it('with argument value', async () => {
            await runDummyCli('1', config);
            checkOptions('1', { argument: true });
          });
        });

        describe('array', () => {
          const config: JHipsterConfig = {
            argument: {
              type: Array,
            },
            scope,
          };

          it('without arguments', async () => {
            await runDummyCli('', config);
            checkOptions(undefined, { argument: true });
          });
          it('with argument value', async () => {
            await runDummyCli('1', config);
            checkOptions(['1'], { argument: true });
          });
          it('with arguments values', async () => {
            await runDummyCli('1 2', config);
            checkOptions(['1', '2'], { argument: true });
          });
        });
      });

      describe.skip('prompt', () => {
        describe('input', () => {
          const config: JHipsterConfig = {
            prompt: {
              message: 'testOption',
              type: 'input',
            },
            scope,
          };

          it('with option', async () => {
            await runDummyCli('', config).withAnswers({ testOption: '1' });
            checkOptions('1');
          });
        });
      });

      describe.skip('jdl', () => {
        describe('boolean jdl option', () => {
          const config: JHipsterConfig = {
            jdl: {
              type: 'boolean',
              tokenType: 'BOOLEAN',
            },
            scope,
          };

          it('without options', async () => {
            await runDummyCli('jdl --inline ""', config);
            checkOptions(undefined);
          });
          it('with true option', async () => {
            await runDummyCli('--test-option', config);
            checkOptions(true);
          });
          it('with false option', async () => {
            await runDummyCli('--no-test-option', config);
            checkOptions(false);
          });
        });
      });
    });
  }
});

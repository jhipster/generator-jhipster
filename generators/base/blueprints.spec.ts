/* eslint-disable max-classes-per-file */
import { before, it, describe, expect, esmocha } from 'esmocha';
import { RunResult } from 'yeoman-test';
import { toHaveBeenCalledAfter } from 'jest-extended';

import { basicHelpers as helpers } from '../../test/support/index.js';
import { packageJson } from '../../lib/index.js';
import BaseGenerator from './index.js';

expect.extend({ toHaveBeenCalledAfter });
const jhipsterVersion = packageJson.version;

describe('generator - base - with blueprint', () => {
  describe('generate application with a version-compatible blueprint', () => {
    let runResult: RunResult;
    before(async () => {
      runResult = await helpers
        .runTestBlueprintGenerator()
        .withFakeTestBlueprint('generator-jhipster-myblueprint', {
          packageJson: {
            dependencies: {
              'generator-jhipster': jhipsterVersion,
            },
          },
        })
        .withMockedGenerators(['jhipster-myblueprint:test-blueprint'])
        .withJHipsterConfig()
        .withOptions({
          skipChecks: false,
          blueprint: 'myblueprint',
        });
    });

    it('creates expected default files for server and angular', () => {
      expect(runResult.mockedGenerators['jhipster-myblueprint:test-blueprint'].called);
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] },
      });
    });
  });

  describe('generate application with a conflicting version blueprint', () => {
    it('throws an error', () =>
      expect(
        helpers
          .runTestBlueprintGenerator()
          .withFakeTestBlueprint('generator-jhipster-myblueprint', {
            packageJson: {
              dependencies: {
                'generator-jhipster': '1.1.1',
              },
            },
          })
          .withMockedGenerators(['jhipster-myblueprint:test-blueprint'])
          .commitFiles()
          .withJHipsterConfig()
          .withOptions({
            skipChecks: false,
            blueprint: 'myblueprint',
          }),
      ).rejects.toThrow(/targets JHipster v1.1.1 and is not compatible with this JHipster version/));
  });

  describe('generating application with a git blueprint', () => {
    it('should succeed', () =>
      helpers
        .runTestBlueprintGenerator()
        .withFakeTestBlueprint('generator-jhipster-myblueprint', {
          packageJson: {
            dependencies: {
              'generator-jhipster': 'gitlab:jhipster/generator-jhipster#main',
            },
          },
        })
        .withMockedGenerators(['jhipster-myblueprint:test-blueprint'])
        .withJHipsterConfig()
        .withOptions({
          skipChecks: false,
          blueprint: 'myblueprint',
        }));
  });

  describe('generate application with a peer version-compatible blueprint', () => {
    let runResult: RunResult;
    before(async () => {
      runResult = await helpers
        .runTestBlueprintGenerator()
        .withFakeTestBlueprint('generator-jhipster-myblueprint', {
          packageJson: {
            peerDependencies: {
              'generator-jhipster': '>=7.0.0-beta.0',
            },
          },
        })
        .withOptions({
          skipChecks: false,
          blueprint: 'myblueprint',
        });
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] },
      });
    });
  });

  describe('generate application with a peer conflicting version blueprint', () => {
    it('throws an error', () =>
      expect(() =>
        helpers
          .runTestBlueprintGenerator()
          .withFakeTestBlueprint('generator-jhipster-myblueprint', {
            packageJson: {
              peerDependencies: {
                'generator-jhipster': '1.1.1',
              },
            },
          })
          .withMockedGenerators(['jhipster-myblueprint:test-blueprint'])
          .withJHipsterConfig()
          .withOptions({
            skipChecks: false,
            blueprint: 'myblueprint',
          }),
      ).rejects.toThrow(/targets JHipster 1.1.1 and is not compatible with this JHipster version/));
  });
});

describe('generator - base - with scoped blueprint', () => {
  describe('generate monolith application with scoped blueprint', () => {
    let runResult: RunResult;
    before(async () => {
      runResult = await helpers
        .runTestBlueprintGenerator()
        .withFakeTestBlueprint('@jhipster/generator-jhipster-scoped-blueprint')
        .withMockedGenerators(['@jhipster/jhipster-scoped-blueprint:test-blueprint'])
        .withJHipsterConfig()
        .withOptions({
          blueprints: '@jhipster/generator-jhipster-scoped-blueprint',
        });
    });

    it('should compose with blueprint', () => {
      expect(runResult.mockedGenerators['@jhipster/jhipster-scoped-blueprint:test-blueprint'].called).toBe(true);
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: '@jhipster/generator-jhipster-scoped-blueprint', version: '9.9.9' }] },
      });
    });
  });
});

describe('generator - base - with blueprints disabled', () => {
  describe('should not compose with blueprint', () => {
    let runResult: RunResult;
    before(async () => {
      runResult = await helpers
        .runTestBlueprintGenerator()
        .withFakeTestBlueprint('@jhipster/generator-jhipster-scoped-blueprint')
        .withMockedGenerators(['@jhipster/jhipster-scoped-blueprint:test-blueprint'])
        .withJHipsterConfig()
        .withOptions({
          blueprints: '@jhipster/generator-jhipster-scoped-blueprint',
          disableBlueprints: true,
        });
    });

    it('should compose with blueprint', () => {
      expect(runResult.mockedGenerators['@jhipster/jhipster-scoped-blueprint:test-blueprint'].called).toBeFalsy;
    });
  });
});

describe('generator - base - with blueprint with constructor error', () => {
  class BlueprintBlueprintedGenerator extends BaseGenerator {
    constructor(args, opts, features) {
      super(args, opts, features);
      throw new Error('blueprint with error');
    }
  }

  describe('generate monolith application with scoped blueprint', () => {
    it('rejects the environment', async () => {
      await expect(
        helpers
          .runTestBlueprintGenerator()
          .withGenerators([[BlueprintBlueprintedGenerator, 'jhipster-throwing-constructor:test-blueprint']])
          .withJHipsterConfig()
          .withOptions({
            blueprints: 'generator-jhipster-throwing-constructor',
          }),
      ).rejects.toThrow('blueprint with error');
    });
  });
});

describe('generator - base - with multiple blueprints', () => {
  describe('generate monolith application with scoped blueprint', () => {
    let runResult: RunResult;

    before(async () => {
      runResult = await helpers
        .runTestBlueprintGenerator()
        .withMockedGenerators(['jhipster-blueprint1:test-blueprint', 'jhipster-blueprint2:test-blueprint'])
        .withJHipsterConfig()
        .withOptions({
          blueprints: 'generator-jhipster-blueprint1,generator-jhipster-blueprint2',
        });
    });
    it('should compose with blueprints once', () => {
      expect(runResult.mockedGenerators['jhipster-blueprint1:test-blueprint'].calledOnce);
      expect(runResult.mockedGenerators['jhipster-blueprint2:test-blueprint'].calledOnce);
    });
  });
});

describe('generator - base - local blueprint', () => {
  const BLUEPRINT_NS = 'jhipster:app';
  const BLUEPRINT_CONTENTS = `export async function createGenerator(env){
    const BaseGenerator = (await env.requireGenerator('${BLUEPRINT_NS}'));
    return class extends BaseGenerator {
      constructor(args, opts, features) {
        super(args, opts, features);
      }

      get [BaseGenerator.WRITING]() {
        return {
          write() {
            this.writeDestination('local-blueprint.txt', 'This is a local blueprint');
          }
        };
      }
    };
  }
  `;

  describe('generates application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(BLUEPRINT_NS)
        .withFiles({ '.blueprint/app/index.mjs': BLUEPRINT_CONTENTS })
        .commitFiles()
        .withJHipsterConfig();
    });

    it('creates expected default files', () => {
      expect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".blueprint/app/index.mjs": {
    "stateCleared": "modified",
  },
  ".yo-rc.json": {
    "stateCleared": "modified",
  },
  "local-blueprint.txt": {
    "stateCleared": "modified",
  },
}
`);
    });
    it('blueprint module and version are in package.json', () => {
      runResult.assertFileContent('local-blueprint.txt', /This is a local blueprint/);
    });
  });
});

describe('generator - base-blueprint', () => {
  const priorities = [
    'initializing',
    'prompting',
    'configuring',
    'composing',
    'loading',
    'preparing',
    'default',
    'writing',
    'postWriting',
    'install',
    'end',
  ];

  const createPrioritiesFakes = (): Record<string, esmocha.Mock> => {
    const mockedPriorities: Record<string, esmocha.Mock> = {};
    priorities.forEach(priority => {
      mockedPriorities[priority] = esmocha.fn();
    });
    return mockedPriorities;
  };

  const createAllBlueprint = mockedPriorities => {
    /**
     * @class
     * @extends {BaseGenerator}
     */
    return class extends BaseGenerator {
      get initializing() {
        return {
          mockedInitializing() {
            mockedPriorities.initializing();
          },
        };
      }

      get [BaseGenerator.INITIALIZING]() {
        return this.initializing;
      }

      get prompting() {
        return {
          mockedPrompting() {
            mockedPriorities.prompting();
          },
        };
      }

      get [BaseGenerator.PROMPTING]() {
        return this.prompting;
      }

      get configuring() {
        return {
          mockedConfiguring() {
            mockedPriorities.configuring();
          },
        };
      }

      get [BaseGenerator.CONFIGURING]() {
        return this.configuring;
      }

      get composing() {
        return {
          mockedComposing() {
            mockedPriorities.composing();
          },
        };
      }

      get [BaseGenerator.COMPOSING]() {
        return this.composing;
      }

      get loading() {
        return {
          mockedLoading() {
            mockedPriorities.loading();
          },
        };
      }

      get [BaseGenerator.LOADING]() {
        return this.loading;
      }

      get preparing() {
        return {
          mockedPreparing() {
            mockedPriorities.preparing();
          },
        };
      }

      get [BaseGenerator.PREPARING]() {
        return this.preparing;
      }

      get default() {
        return {
          mockedDefault() {
            mockedPriorities.default();
          },
        };
      }

      get [BaseGenerator.DEFAULT]() {
        return this.default;
      }

      get writing() {
        return {
          mockedWriting() {
            mockedPriorities.writing();
          },
        };
      }

      get [BaseGenerator.WRITING]() {
        return this.writing;
      }

      get postWriting() {
        return {
          mockedPostWriting() {
            mockedPriorities.postWriting();
          },
        };
      }

      get [BaseGenerator.POST_WRITING]() {
        return this.postWriting;
      }

      get install() {
        return {
          mockedInstall() {
            mockedPriorities.install();
          },
        };
      }

      get [BaseGenerator.INSTALL]() {
        return this.install;
      }

      get end() {
        return {
          mockedEnd() {
            mockedPriorities.end();
          },
        };
      }

      get [BaseGenerator.END]() {
        return this.end;
      }
    };
  };

  describe('priorities', () => {
    describe('when every priority has been implemented', () => {
      let mockedPriorities: Record<string, esmocha.Mock>;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = createAllBlueprint(mockedPriorities);
        return helpers.run(mockBlueprintSubGen);
      });

      priorities.forEach((priority, idx) => {
        it(`should execute ${priority} once`, () => {
          expect(mockedPriorities[priority]).toBeCalledTimes(1);
        });
        if (idx > 0) {
          const priorityBefore = priorities[idx - 1];
          it(`should execute ${priority} after ${priorityBefore} `, () => {
            expect(mockedPriorities[priority]).toHaveBeenCalledAfter(mockedPriorities[priorityBefore]);
          });
        }
      });
    });

    describe('when custom priorities are missing and the blueprint is sbs', () => {
      let mockedPriorities;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = class extends createAllBlueprint(mockedPriorities) {
          constructor(args, opts, features) {
            super(args, opts, features);
            this.sbsBlueprint = true;
          }

          get [BaseGenerator.INITIALIZING]() {
            return super.initializing;
          }

          get [BaseGenerator.PROMPTING]() {
            return super.prompting;
          }

          get [BaseGenerator.CONFIGURING]() {
            return super.configuring;
          }

          get [BaseGenerator.DEFAULT]() {
            return super.default;
          }

          get [BaseGenerator.WRITING]() {
            return super.writing;
          }

          get [BaseGenerator.INSTALL]() {
            return super.install;
          }

          get [BaseGenerator.END]() {
            return super.end;
          }
        };
        return helpers.create(mockBlueprintSubGen).run();
      });

      priorities.forEach(priority => {
        if (['composing', 'loading', 'preparing', 'postWriting'].includes(priority)) {
          it(`should not execute ${priority}`, () => {
            expect(mockedPriorities[priority]).not.toBeCalled();
          });
        } else {
          it(`should execute ${priority} once`, () => {
            expect(mockedPriorities[priority]).toBeCalledTimes(1);
          });
        }
      });
    });
  });
});

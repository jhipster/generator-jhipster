import { jestExpect as expect } from 'mocha-expect-snapshot';
import { RunResult } from 'yeoman-test';
import { basicHelpers as helpers } from '../../test/support/index.mjs';
import { packageJson } from '../../lib/index.mjs';
import BaseGenerator from './index.mjs';

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
          })
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
              'generator-jhipster': '^7.0.0-beta.0',
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
          })
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
      expect(runResult.mockedGenerators['@jhipster/jhipster-scoped-blueprint:test-blueprint'].called);
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: '@jhipster/generator-jhipster-scoped-blueprint', version: '9.9.9' }] },
      });
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
          })
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

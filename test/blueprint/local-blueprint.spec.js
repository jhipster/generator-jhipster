/* eslint-disable no-unused-expressions */
const path = require('path');
const { expect: jestExpect } = require('expect');
const { mkdirSync, writeFileSync } = require('fs');

const { skipPrettierHelpers: helpers } = require('../utils/utils');

const BLUEPRINT_NS = 'jhipster:app';
const BLUEPRINT_CONTENTS = `export async function createGenerator(env){
  return class extends (await env.requireGenerator('${BLUEPRINT_NS}')) {
    constructor(args, opts, features) {
      super(args, opts, features);
    }

    get writing() {
      return {
        write() {
          this.writeDestination('local-blueprint.txt', 'This is a local blueprint');
        }
      };
    }
  };
}
`;

describe('Local blueprint', () => {
  describe('generates application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(BLUEPRINT_NS)
        .inTmpDir(dir => {
          // Add a local blueprint implementation
          const applicationDir = path.join(dir, '.blueprint/app');
          mkdirSync(applicationDir, { recursive: true });
          writeFileSync(path.join(applicationDir, 'index.mjs'), BLUEPRINT_CONTENTS);
        })
        .withOptions({
          defaults: true,
        });
    });

    it('creates expected default files', () => {
      jestExpect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
Object {
  ".yo-rc.json": Object {
    "stateCleared": "modified",
  },
  "local-blueprint.txt": Object {
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

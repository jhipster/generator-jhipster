/* eslint-disable no-unused-expressions */
import path from 'path';
import { jestExpect } from 'mocha-expect-snapshot';
import { mkdirSync, writeFileSync } from 'fs';

import { skipPrettierHelpers as helpers } from '../utils/utils.mjs';

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

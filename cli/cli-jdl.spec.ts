import { join } from 'node:path';

import { execa } from 'execa';

import { getPackageRoot } from '../lib/index.ts';
import { basicHelpers as helpers, runResult } from '../lib/testing/index.ts';

const jhipsterCli = join(getPackageRoot(), 'bin/jhipster.cjs');

describe('allows customizing JDL definitions', () => {
  it('accepts a custom JDL definition', async () => {
    await helpers
      .prepareTemporaryDir()
      .withFiles({
        '.blueprint/package.json': JSON.stringify({ type: 'module' }),
        '.blueprint/app/index.js': `export const command = {
  configs: {
    fooConfig: {
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      scope: 'storage',
    },
  },
};`,
      })
      .commitFiles();
    await execa(jhipsterCli, ['jdl', '--json-only', '--inline', 'application { config { fooConfig false } }'], { stdio: 'pipe' });
    runResult.assertJsonFileContent('.yo-rc.json', {
      'generator-jhipster': {
        fooConfig: false,
      },
    });
  });
});

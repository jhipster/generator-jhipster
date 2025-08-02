import { join } from 'path';
import { execa } from 'execa';
import { basicHelpers as helpers, runResult } from '../lib/testing/index.ts';
import { getPackageRoot } from '../lib/index.ts';

const jhipsterCli = join(getPackageRoot(), 'bin/jhipster.cjs');

describe('allows customizing JDL definitions', () => {
  it('accepts a custom JDL definition', async () => {
    await helpers
      .prepareTemporaryDir()
      .withFiles({
        '.blueprint/app/index.mjs': `export const command = {
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

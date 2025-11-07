import { describe, it } from 'esmocha';
import { basename, join } from 'node:path';

import { basicHelpers as helpers } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import Generator from './generator.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  it('should not fail', async () => {
    await helpers.runJHipster(join(import.meta.dirname, 'index.ts'), undefined, { bail: true } as any);
  });
});

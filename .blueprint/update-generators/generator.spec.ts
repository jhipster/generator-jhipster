import { describe, it } from 'esmocha';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { basicHelpers as helpers } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import Generator from './generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  it('should not fail', async () => {
    await helpers.runJHipster(join(__dirname, 'index.ts'), undefined, { bail: true } as any);
  });
});

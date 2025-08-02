import { before, describe, expect, it } from 'esmocha';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import { workflowChoices } from './command.ts';
import Generator from './generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  for (const workflow of workflowChoices) {
    describe(`with ${workflow}`, () => {
      before(async () => {
        await helpers.runJHipster(join(__dirname, 'index.ts'), { useEnvironmentBuilder: true }).withArguments(workflow);
      });

      it('should set workflow value', () => {
        expect((runResult.generator as any).workflow).toBe(workflow);
      });
      it('should match matrix value', () => {
        expect((runResult.generator as any).matrix).toMatchSnapshot();
      });
    });
  }
});

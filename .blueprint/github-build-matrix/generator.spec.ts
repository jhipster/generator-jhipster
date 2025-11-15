import { before, describe, expect, it } from 'esmocha';
import { basename, join } from 'node:path';

import { defaultHelpers as helpers, resultWithGenerator } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/index.ts';

import { workflowChoices } from './command.ts';
import Generator from './generator.ts';

const runResult = resultWithGenerator<Generator>();
const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  for (const workflow of workflowChoices) {
    describe(`with ${workflow}`, () => {
      before(async () => {
        await helpers.runJHipster(join(import.meta.dirname, 'index.ts'), { useEnvironmentBuilder: true }).withArguments(workflow);
      });

      it('should set workflow value', () => {
        expect(runResult.generator.workflow).toBe(workflow);
      });
      it('should match matrix value', () => {
        expect(runResult.generator.matrix).toMatchSnapshot();
      });
    });
  }
});

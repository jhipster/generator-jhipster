import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';
import { getGithubSamplesGroups, defaultHelpers as helpers, runResult } from 'generator-jhipster/testing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, async () => {
  const groups = await getGithubSamplesGroups(join(__dirname, '../generate-sample/templates/'));
  for (const workflow of groups.map(sample => sample.split('.')[0])) {
    describe(`with ${workflow}`, () => {
      beforeAll(async () => {
        await helpers.runJHipster(join(__dirname, 'index.mjs'), { useEnvironmentBuilder: true }).withArguments(workflow);
      });

      it('should match matrix value', () => {
        expect(runResult.generator.matrix).toMatchSnapshot();
      });
    });
  }
});

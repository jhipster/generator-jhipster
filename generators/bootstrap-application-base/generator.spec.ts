/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { before, beforeEach, describe, expect, it } from 'esmocha';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { basicTests, shouldSupportFeatures } from '../../test/support/tests.js';
import { parseChangelog } from '../base/support/timestamp.ts';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.ts');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    const generatorList: Record<string, string> = await import('../generator-list.ts');
    await expect(generatorList[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  basicTests({
    requiredConfig: {},
    defaultConfig: {},
    customPrompts: {
      baseName: 'BeautifulProject',
    },
    generatorPath,
  });

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig();
      });

      it('should succeed', () => {
        expect(runResult.getSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "contents": "{
  "generator-jhipster": {
    "baseName": "jhipster",
    "creationTimestamp": 1577836800000,
    "entities": []
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });
  describe('nextTimestamp', () => {
    describe('when there is no configured lastLiquibaseTimestamp', () => {
      let firstChangelogDate: string;
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig();
        firstChangelogDate = runResult.generator.nextTimestamp();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).toBe(true);
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(runResult.generator.config.get('lastLiquibaseTimestamp')).toBe(parseChangelog(firstChangelogDate).getTime());
      });
    });
    describe('when a past lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate: string;
      before(async () => {
        const lastLiquibaseTimestamp = new Date(2000, 1, 1);
        await helpers.runJHipster(generator).withJHipsterConfig({ lastLiquibaseTimestamp: lastLiquibaseTimestamp.getTime() });
        firstChangelogDate = runResult.generator.nextTimestamp();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).toBe(true);
      });
      it('should not return a past changelog date', () => {
        expect(firstChangelogDate.startsWith('2000')).toBe(false);
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(runResult.generator.config.get('lastLiquibaseTimestamp')).toBe(parseChangelog(firstChangelogDate).getTime());
      });
    });
    describe('when a future lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate: string;
      let secondChangelogDate: string;
      beforeEach(async () => {
        const lastLiquibaseTimestamp = new Date(Date.parse('2030-01-01'));
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({ lastLiquibaseTimestamp: lastLiquibaseTimestamp.getTime(), creationTimestamp: undefined })
          .withOptions({ reproducible: false });
        firstChangelogDate = runResult.generator.nextTimestamp();
        secondChangelogDate = runResult.generator.nextTimestamp();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).toBe(true);
      });
      it('should return a future changelog date', () => {
        expect(firstChangelogDate.startsWith('2030')).toBe(true);
      });
      it('should return a reproducible changelog date', () => {
        expect(firstChangelogDate).toBe('20300101000001');
        expect(secondChangelogDate).toBe('20300101000002');
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(runResult.generator.config.get('lastLiquibaseTimestamp')).toBe(parseChangelog('20300101000002').getTime());
      });
    });
    describe('with reproducible=false argument', () => {
      let firstChangelogDate: string;
      let secondChangelogDate: string;
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig();
        firstChangelogDate = runResult.generator.nextTimestamp();
        secondChangelogDate = runResult.generator.nextTimestamp();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).toBe(true);
        expect(/^\d{14}$/.test(secondChangelogDate)).toBe(true);
      });
      it('should return a reproducible changelog date incremental to lastLiquibaseTimestamp', () => {
        expect(firstChangelogDate).not.toBe(secondChangelogDate);
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(runResult.generator.config.get('lastLiquibaseTimestamp')).toBe(parseChangelog(secondChangelogDate).getTime());
      });
    });
    describe('with a past creationTimestamp option', () => {
      let firstChangelogDate: string;
      let secondChangelogDate: string;

      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig().withOptions({ creationTimestamp: '2000-01-01' });

        firstChangelogDate = runResult.generator.nextTimestamp();
        secondChangelogDate = runResult.generator.nextTimestamp();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).toBe(true);
      });
      it('should return a past changelog date', () => {
        expect(firstChangelogDate.startsWith('2000')).toBe(true);
      });
      it('should return a reproducible changelog date', () => {
        expect(firstChangelogDate).toBe('20000101000100');
        expect(secondChangelogDate).toBe('20000101000200');
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(runResult.generator.config.get('lastLiquibaseTimestamp')).toBe(parseChangelog('20000101000200').getTime());
      });
    });
    describe('with a future creationTimestamp option', () => {
      it('should throw', async () => {
        await expect(helpers.runJHipster(generator).withJHipsterConfig().withOptions({ creationTimestamp: '2030-01-01' })).rejects.toThrow(
          /^Creation timestamp should not be in the future: 2030-01-01\.$/,
        );
      });
    });
  });
});

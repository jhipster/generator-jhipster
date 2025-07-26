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
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { basicHelpers, defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.js';
import { GENERATOR_COMMON } from '../generator-list.js';
import { asPostWritingTask } from '../base-application/support/task-type-inference.js';
import Generator from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const mockedGenerators = ['jhipster:git'];

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, GENERATOR_COMMON);

  describe('source apis', () => {
    describe('ignoreSonarRule', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig()
          .withMockedJHipsterGenerators()
          .withSkipWritingPriorities()
          .withFiles({
            'sonar-project.properties': ' ',
          })
          .withTask(
            'postWriting',
            asPostWritingTask(function ({ source }) {
              source.ignoreSonarRule!({ ruleId: 'ruleId', ruleKey: 'ruleKey', resourceKey: 'resourceKey', comment: 'comment' });
              source.ignoreSonarRule!({ ruleId: 'ruleId2', ruleKey: 'ruleKey2', resourceKey: 'resourceKey2', comment: 'comment 2' });
            }),
          );
      });

      it('should ignore sonar rule', () => {
        expect(runResult.getSnapshot('**/sonar-project.properties')).toMatchSnapshot();
      });
    });
    describe('addSonarProperties', () => {
      describe('with empty properties', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig()
            .withMockedJHipsterGenerators()
            .withSkipWritingPriorities()
            .withFiles({
              'sonar-project.properties': ' ',
            })
            .withTask(
              'postWriting',
              asPostWritingTask(function ({ source }) {
                source.addSonarProperties!([{ key: 'sonar.new.property', value: 'newValue', comment: 'New property comment' }]);
              }),
            );
        });

        it('should ignore sonar rule', () => {
          expect(runResult.getSnapshot('**/sonar-project.properties')).toMatchSnapshot();
        });
      });
      describe('with existing sonar.issue.ignore.multicriteria key', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig()
            .withMockedJHipsterGenerators()
            .withSkipWritingPriorities()
            .withFiles({
              'sonar-project.properties': '\n\nsonar.issue.ignore.multicriteria = ruleId, ruleId2',
            })
            .withTask(
              'postWriting',
              asPostWritingTask(function ({ source }) {
                source.addSonarProperties!([{ key: 'sonar.new.property', value: 'newValue', comment: 'New property comment' }]);
              }),
            );
        });

        it('should ignore sonar rule', () => {
          expect(runResult.getSnapshot('**/sonar-project.properties')).toMatchSnapshot();
        });
      });
    });
  });

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig().withMockedGenerators(mockedGenerators);
      });

      it('should succeed', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });

      it('should add generator-jhipster to package.json', () => {
        runResult.assertFileContent('package.json', 'generator-jhipster');
      });
    });
    describe('Custom prettier', () => {
      before(async () => {
        await basicHelpers
          .runJHipster(generator)
          .withJHipsterConfig({
            prettierTabWidth: 10,
          })
          .withMockedGenerators(mockedGenerators);
      });

      it('writes custom .prettierrc', () => {
        runResult.assertFileContent('.prettierrc', /tabWidth: 10/);
      });

      it('uses custom prettier formatting to js file', () => {
        runResult.assertFileContent('.lintstagedrc.cjs', / {10}'{/);
      });
    });
  });
});

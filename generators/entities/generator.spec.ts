/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from './generator.js';
import { skipPrettierHelpers as helpers, result as runResult } from '../../test/support/index.js';

const { snakeCase } = lodash;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generator = basename(__dirname);
const generatorPath = `${__dirname}/index.ts`;

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('regenerating', () => {
    const entities = [
      {
        name: 'Foo',
        changelogDate: '20160926101210',
      },
      {
        name: 'Bar',
        changelogDate: '20160926101211',
      },
      {
        name: 'Skip',
        changelogDate: '20160926101212',
      },
    ];

    const fooFiles = [
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
      `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`,
      `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.model.ts`,
    ];

    const barFiles = [
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101211_added_entity_Bar.xml`,
      `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
      `${CLIENT_MAIN_SRC_DIR}app/entities/bar/bar.model.ts`,
    ];

    const skipFiles = [
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101212_added_entity_Skip.xml`,
      `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Skip.java`,
      `${CLIENT_MAIN_SRC_DIR}app/entities/skip/skip.model.ts`,
    ];

    describe('some entities', () => {
      before(async () => {
        await helpers
          .run(generatorPath)
          .withJHipsterConfig({}, entities)
          .withArguments(['Foo', 'Bar'])
          .withOptions({
            regenerate: true,
            force: true,
            ignoreNeedlesError: true,
          })
          .withMockedSource();
      });

      it('should match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      it('should match source calls', () => {
        expect(runResult.sourceCallsArg).toMatchSnapshot();
      });

      it('should create files for entity Foo', () => {
        runResult.assertFile(fooFiles);
      });

      it('should create files for the entity Bar', () => {
        runResult.assertFile(barFiles);
      });

      it('should not create files for the entity Skip', () => {
        runResult.assertNoFile(skipFiles);
      });
    });

    describe('all entities', () => {
      before(async () => {
        await helpers
          .run(generatorPath)
          .withJHipsterConfig({}, entities)
          .withOptions({
            regenerate: true,
            force: true,
            ignoreNeedlesError: true,
          })
          .withMockedSource();
      });

      it('should match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      it('should match source calls', () => {
        expect(runResult.sourceCallsArg).toMatchSnapshot();
      });

      it('should create files for entity Foo', () => {
        runResult.assertFile(fooFiles);
      });

      it('should create files for the entity Bar', () => {
        runResult.assertFile(barFiles);
      });

      it('should create files for the entity Skip', () => {
        runResult.assertFile(skipFiles);
      });
    });
  });
});

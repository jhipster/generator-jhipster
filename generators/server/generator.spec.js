/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import assert from 'assert/strict';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import { shouldSupportFeatures, testBlueprintSupport, checkEnforcements } from '../../test/support/index.js';
import { defaultHelpers as helpers, result as runResult } from '../../testing/index.js';
import Generator from './index.js';
import { mockedGenerators, shouldComposeWithCouchbase, shouldComposeWithSpringCloudStream } from './__test-support/index.js';
import { GENERATOR_SERVER, GENERATOR_SPRING_BOOT } from '../generator-list.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.js');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, GENERATOR_SERVER, GENERATOR_SPRING_BOOT);

  describe('composing', () => {
    describe('buildTool option', () => {
      describe('maven', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              buildTool: 'maven',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });

        it('should compose with maven generator', () => {
          assert(runResult.mockedGenerators['jhipster:maven'].calledOnce);
        });
        it('should not compose with others buildTool generators', () => {
          assert(runResult.mockedGenerators['jhipster:gradle'].notCalled);
        });
      });
      describe('gradle', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              buildTool: 'gradle',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });

        it('should compose with gradle generator', () => {
          assert(runResult.mockedGenerators['jhipster:gradle'].called);
        });
        it('should not compose with others buildTool generators', () => {
          assert(runResult.mockedGenerators['jhipster:maven'].notCalled);
        });
      });
    });

    describe('messageBroker option', () => {
      describe('no', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              messageBroker: 'no',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });

        shouldComposeWithSpringCloudStream(false, () => runResult);
      });
      describe('kafka', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              messageBroker: 'kafka',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });
        shouldComposeWithSpringCloudStream(true, () => runResult);
      });
      describe('pulsar', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              messageBroker: 'pulsar',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });
        shouldComposeWithSpringCloudStream(true, () => runResult);
      });
    });

    describe('databaseType option', () => {
      describe('no with jwt', () => {
        before(async () => {
          await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'jwt',
            })
            .withMockedGenerators(mockedGenerators);
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('no with session', () => {
        before(async () => {
          await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'session',
            })
            .withMockedGenerators(mockedGenerators);
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('no with oauth2', () => {
        before(async () => {
          await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'oauth2',
            })
            .withMockedGenerators(mockedGenerators);
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('couchbase', () => {
        let runResult;
        before(async () => {
          runResult = await helpers
            .run(generatorPath)
            .withJHipsterConfig({
              databaseType: 'couchbase',
            })
            .withSkipWritingPriorities()
            .withMockedGenerators(mockedGenerators);
        });
        shouldComposeWithCouchbase(true, () => runResult);
      });
    });
  });

  describe('with entities', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_SERVER).withJHipsterConfig({ skipClient: true }, [
        { name: 'Foo', changelogDate: '20160926101210', fields: [{ fieldName: 'name', fieldType: 'String' }] },
        {
          name: 'Bar',
          changelogDate: '20160926101211',
          dto: 'mapstruct',
          fields: [{ fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required'] }],
        },
      ]);
    });

    it('should match files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});

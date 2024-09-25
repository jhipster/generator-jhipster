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
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.js';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import { GENERATOR_SERVER, GENERATOR_SPRING_BOOT } from '../generator-list.js';
import { filterBasicServerGenerators, shouldComposeWithCouchbase, shouldComposeWithSpringCloudStream } from './__test-support/index.js';
import Generator from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, GENERATOR_SERVER, GENERATOR_SPRING_BOOT);

  describe('composing', () => {
    describe('messageBroker option', () => {
      describe('no', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              messageBroker: 'no',
            })
            .withSkipWritingPriorities()
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });

        shouldComposeWithSpringCloudStream(false, () => runResult);
      });
      describe('kafka', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              messageBroker: 'kafka',
            })
            .withSkipWritingPriorities()
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });
        shouldComposeWithSpringCloudStream(true, () => runResult);
      });
      describe('pulsar', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              messageBroker: 'pulsar',
            })
            .withSkipWritingPriorities()
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });
        shouldComposeWithSpringCloudStream(true, () => runResult);
      });
    });

    describe('databaseType option', () => {
      describe('no with jwt', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'jwt',
            })
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('no with session', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'session',
            })
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('no with oauth2', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              databaseType: 'no',
              authenticationType: 'oauth2',
            })
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });

        it('should match generated files', () => {
          expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });

        shouldComposeWithCouchbase(false, () => runResult);
      });
      describe('couchbase', () => {
        before(async () => {
          await helpers
            .runJHipster(generator)
            .withJHipsterConfig({
              databaseType: 'couchbase',
            })
            .withSkipWritingPriorities()
            .withMockedSource({ except: ['addTestSpringFactory'] })
            .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
        });
        shouldComposeWithCouchbase(true, () => runResult);
      });
    });
  });

  describe('with entities', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_SERVER)
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withJHipsterConfig({ skipClient: true }, [
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

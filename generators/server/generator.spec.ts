/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.ts';

import { filterBasicServerGenerators, shouldComposeWithCouchbase } from './__test-support/index.ts';
import Generator from './index.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, generator, 'spring-boot');

  describe('composing', () => {
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
        .runJHipster(generator)
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

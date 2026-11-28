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
import { before, describe, expect, it } from 'expect-node';
import { basename } from 'node:path';

import { filterBasicServerGenerators, shouldComposeWithCouchbase } from './__test-support/index.ts';
import Generator from './index.ts';

import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, result as runResult } from '#testing';

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

        it('should match generated files snapshot', () => {
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

        it('should match generated files snapshot', () => {
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

        it('should match generated files snapshot', () => {
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

  describe('with readonly fields', () => {
    const entityFile = 'src/main/java/com/mycompany/myapp/domain/Foo.java';
    const assertsFile = 'src/test/java/com/mycompany/myapp/domain/FooAsserts.java';
    const resourceFile = 'src/test/java/com/mycompany/myapp/web/rest/FooResourceIT.java';

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withJHipsterConfig({ skipClient: true, prodDatabaseType: 'mysql' }, [
          {
            name: 'Foo',
            changelogDate: '20160926101210',
            fields: [
              { fieldName: 'name', fieldType: 'String' },
              { fieldName: 'readonlyField', fieldType: 'String', options: { readonly: true } },
              { fieldName: 'readonlyUuid', fieldType: 'UUID', options: { readonly: true } },
            ],
          },
        ]);
    });

    it('should not insert nor update the readonly fields', () => {
      runResult.assertFileContent(entityFile, /@Column\(\s*name = "readonly_field"\s*, updatable = false, insertable = false\s*\)/);
      runResult.assertFileContent(entityFile, /@Column\(name = "readonly_uuid", length = 36, updatable = false, insertable = false\)/);
      expect(runResult.fs.read(entityFile).match(/updatable = false/g)).toHaveLength(2);
    });

    it('should not assert the readonly fields as persisted', () => {
      runResult.assertNoFileContent(assertsFile, 'ReadonlyField');
      runResult.assertNoFileContent(assertsFile, 'ReadonlyUuid');
      runResult.assertNoFileContent(resourceFile, 'ReadonlyField');
      runResult.assertNoFileContent(resourceFile, 'ReadonlyUuid');
    });
  });

  describe('with a filtering entity declaring no service', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withJHipsterConfig({ skipClient: true }, [
          { name: 'Foo', changelogDate: '20160926101210', jpaMetamodelFiltering: true, service: 'no', fields: [] },
        ]);
    });

    it('should disable its filtering', () => {
      runResult.assertNoFile('src/main/java/com/mycompany/myapp/service/FooQueryService.java');
      runResult.assertJsonFileContent('.jhipster/Foo.json', { jpaMetamodelFiltering: false, service: 'no' });
    });
  });

  describe('with a filtering entity of a mongodb application', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withJHipsterConfig({ skipClient: true, databaseType: 'mongodb' }, [
          { name: 'Foo', changelogDate: '20160926101210', jpaMetamodelFiltering: true, fields: [] },
        ]);
    });

    it('should disable its filtering', () => {
      runResult.assertNoFile('src/main/java/com/mycompany/myapp/service/FooQueryService.java');
      runResult.assertJsonFileContent('.jhipster/Foo.json', { jpaMetamodelFiltering: false });
    });
  });
});

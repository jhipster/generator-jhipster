import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { CLIENT_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR } from '../generator-constants.js';
import { GENERATOR_ENTITY } from '../generator-list.ts';

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };
const entityBar = { name: 'Bar', changelogDate: '20160926101211' };

describe('generator - entity --single-entity', () => {
  describe('when regenerating', () => {
    describe('with default configuration', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_ENTITY)
          .withMockedGenerators(['jhipster:languages'])
          .withJHipsterConfig({}, [entityFoo, entityBar])
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withArguments(['Foo'])
          .withOptions({ ignoreNeedlesError: true, regenerate: true, force: true, singleEntity: true })
          .withMockedSource();
      });

      it('should match source calls', () => {
        expect(runResult.sourceCallsArg).toMatchSnapshot();
      });

      it('should create files for entity Foo', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.model.ts`,
        ]);
      });

      it('should not create files for the entity Bar', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101211_added_entity_Bar.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/bar/bar.model.ts`,
        ]);
      });
    });

    describe('with cassandra database', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_ENTITY)
          .withMockedGenerators(['jhipster:languages'])
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo, entityBar])
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withArguments(['Foo'])
          .withOptions({ ignoreNeedlesError: true, regenerate: true, force: true, singleEntity: true });
      });

      it('should create files for entity Foo', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`,
        ]);
      });

      it('should not create files for the entity Bar', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101211_added_entity_Bar.cql`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
        ]);
      });
    });
  });
});

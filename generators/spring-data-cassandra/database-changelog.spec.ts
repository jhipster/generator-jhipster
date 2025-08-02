import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';

import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { GENERATOR_SPRING_DATA_CASSANDRA } from '../generator-list.ts';

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - app - database changelogs', () => {
  describe('when regenerating the application', () => {
    describe('with cassandra database', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_SPRING_DATA_CASSANDRA)
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withOptions({ force: true, skipClient: true });
      });

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
  });
});

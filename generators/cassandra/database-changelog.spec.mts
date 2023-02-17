import { basicHelpers as helpers } from '../../test/support/index.mjs';

import { SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_CASSANDRA } from '../generator-list.mjs';

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - app - database changelogs', () => {
  context('when regenerating the application', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .runJHipster(GENERATOR_CASSANDRA)
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withOptions({ withEntities: true, force: true, skipClient: true });
      });

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
  });
});

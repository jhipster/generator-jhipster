import { basicHelpers as helpers } from '../support/index.mjs';

import { SERVER_MAIN_RES_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - app - database changelogs', () => {
  context('when regenerating the application', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(() =>
        helpers
          .create(getGenerator('app'))
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withOptions({ withEntities: true, force: true, skipClient: true })
          .run()
          .then(result => {
            runResult = result;
          })
      );

      after(() => runResult.cleanup());

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
  });
});

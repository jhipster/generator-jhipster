import path from 'path';
import fse from 'fs-extra';
import helpers from 'yeoman-test';
import createMockedConfig from '../support/mock-config.mjs';

import { SERVER_MAIN_RES_DIR } from '../../generators/generator-constants.mjs';
import { getEntityTemplatePath, getGenerator } from '../support/index.mjs';

describe('generator - app - database changelogs', () => {
  context('when regenerating the application', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(() =>
        helpers
          .create(getGenerator('app'))
          .doInDir(dir => {
            createMockedConfig('05-cassandra', dir, { appDir: '' });
            fse.copySync(getEntityTemplatePath('Simple'), path.join(dir, '.jhipster/Foo.json'));
          })
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

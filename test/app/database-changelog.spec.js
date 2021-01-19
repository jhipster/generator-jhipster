const path = require('path');
const fse = require('fs-extra');
const helpers = require('yeoman-test');

const { SERVER_MAIN_RES_DIR } = require('../../generators/generator-constants');

describe('jhipster:app database changelogs', () => {
  context('when regenerating the application', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/app'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/compose/05-cassandra'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
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

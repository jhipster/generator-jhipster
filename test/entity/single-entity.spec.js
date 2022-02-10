const path = require('path');
const fse = require('fs-extra');
const helpers = require('yeoman-test');

const { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, CLIENT_MAIN_SRC_DIR } = require('../../generators/generator-constants');

const DEFAULT_TEST_OPTIONS = { fromCli: true, skipInstall: true, skipChecks: true, skipPrettier: true };

describe('jhipster:entity --single-entity', () => {
  context('when regenerating', () => {
    describe('with default configuration', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entity'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/default'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple2.json'), path.join(dir, '.jhipster/Bar.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true, singleEntity: true })
          .run()
          .then(result => {
            runResult = result;
          })
      );

      after(() => runResult.cleanup());

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
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entity'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/compose/05-cassandra'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple2.json'), path.join(dir, '.jhipster/Bar.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true, singleEntity: true })
          .run()
          .then(result => {
            runResult = result;
          })
      );

      after(() => runResult.cleanup());

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

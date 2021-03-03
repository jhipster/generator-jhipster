const path = require('path');
const fse = require('fs-extra');
const helpers = require('yeoman-test');

const { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, CLIENT_MAIN_SRC_DIR } = require('../../generators/generator-constants');

const DEFAULT_TEST_OPTIONS = { fromCli: true, skipInstall: true, skipChecks: true, skipPrettier: true };

describe('jhipster:entities', () => {
  context('when regenerating', () => {
    describe('some entities', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entities'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/default'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple2.json'), path.join(dir, '.jhipster/Bar.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple3.json'), path.join(dir, '.jhipster/Skip.json'));
          })
          .withArguments(['Foo', 'Bar'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true })
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

      it('should create files for the entity Bar', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101211_added_entity_Bar.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/bar/bar.model.ts`,
        ]);
      });

      it('should not create files for the entity Skip', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101212_added_entity_Skip.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Skip.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/skip/skip.model.ts`,
        ]);
      });
    });

    describe('selected entities with writeEveryEntity', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entities'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/default'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple2.json'), path.join(dir, '.jhipster/Bar.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple3.json'), path.join(dir, '.jhipster/Skip.json'));
          })
          .withArguments(['Foo', 'Bar'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true, writeEveryEntity: true })
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

      it('should create files for the entity Bar', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101211_added_entity_Bar.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/bar/bar.model.ts`,
        ]);
      });

      it('should create files for the entity Skip', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101212_added_entity_Skip.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Skip.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/skip/skip.model.ts`,
        ]);
      });
    });

    describe('all entities', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entities'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/default'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple2.json'), path.join(dir, '.jhipster/Bar.json'));
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple3.json'), path.join(dir, '.jhipster/Skip.json'));
          })
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true })
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

      it('should create files for the entity Bar', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101211_added_entity_Bar.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Bar.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/bar/bar.model.ts`,
        ]);
      });

      it('should create files for the entity Skip', () => {
        runResult.assertFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101212_added_entity_Skip.xml`,
          `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Skip.java`,
          `${CLIENT_MAIN_SRC_DIR}app/entities/skip/skip.model.ts`,
        ]);
      });
    });
  });
});

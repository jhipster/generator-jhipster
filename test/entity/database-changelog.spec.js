const path = require('path');
const fse = require('fs-extra');
const helpers = require('yeoman-test');

const { SERVER_MAIN_RES_DIR } = require('../../generators/generator-constants');

describe('jhipster:entity database changelogs', () => {
  context('when regenerating the entity', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entity'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/compose/05-cassandra'), dir);
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true })
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
    describe('with gateway application type', () => {
      let runResult;
      before(() =>
        helpers
          .create(require.resolve('../../generators/entity'))
          .doInDir(dir => {
            fse.copySync(path.join(__dirname, '../templates/compose/01-gateway'), dir);
            const jsonFile = path.join(dir, '.jhipster/Foo.json');
            fse.copySync(path.join(__dirname, '../templates/.jhipster/Simple.json'), jsonFile);
            fse.writeJsonSync(jsonFile, {
              ...fse.readJsonSync(jsonFile),
              microservicePath: 'microservice1',
              microserviceName: 'microservice1',
            });
          })
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true })
          .run()
          .then(result => {
            runResult = result;
          })
      );

      after(() => runResult.cleanup());

      it('should not create database changelogs', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
        ]);
      });
    });
  });
});

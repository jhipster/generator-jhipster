import path from 'path';
import fse from 'fs-extra';

import { skipPrettierHelpers as helpers } from '../support/helpers.mjs';
import { SERVER_MAIN_RES_DIR } from '../../generators/generator-constants.mjs';
import createMockedConfig from '../support/mock-config.mjs';
import { getEntityTemplatePath, getGenerator } from '../support/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/generator.mjs';

class MockedLanguagesGenerator extends BaseApplicationGenerator<any> {
  get [BaseApplicationGenerator.PREPARING]() {
    return {
      mockTranslations({ control }) {
        control.getWebappTranslation = () => 'translations';
      },
    };
  }
}

describe('generator - entity database changelogs', () => {
  context('when regenerating the entity', () => {
    describe('with cassandra database', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .doInDir(dir => {
            createMockedConfig('05-cassandra', dir, { appDir: '' });
            fse.copySync(getEntityTemplatePath('Simple'), path.join(dir, '.jhipster/Foo.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true });
      });

      after(() => runResult.cleanup());

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
    describe('with gateway application type', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .doInDir(dir => {
            createMockedConfig('01-gateway', dir, { appDir: '' });
            const jsonFile = path.join(dir, '.jhipster/Foo.json');
            fse.copySync(getEntityTemplatePath('Simple'), jsonFile);
            fse.writeJsonSync(jsonFile, {
              ...fse.readJsonSync(jsonFile),
              microservicePath: 'microservice1',
              microserviceName: 'microservice1',
            });
          })
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true });
      });

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

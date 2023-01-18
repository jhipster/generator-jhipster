import path from 'path';
import fse from 'fs-extra';

import { skipPrettierHelpers as helpers } from '../support/helpers.mjs';
import { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import createMockedConfig from '../support/mock-config.mjs';
import { getTemplatePath, getEntityTemplatePath, getGenerator } from '../support/index.mjs';
import BaseApplicationGenerator from '../../generators/base-application/generator.mjs';

const DEFAULT_TEST_OPTIONS = { skipInstall: true, skipChecks: true, skipPrettier: true };

class MockedLanguagesGenerator extends BaseApplicationGenerator<any> {
  get [BaseApplicationGenerator.PREPARING]() {
    return {
      mockTranslations({ control }) {
        control.getWebappTranslation = () => 'translations';
      },
    };
  }
}

describe('generator - entity --single-entity', () => {
  context('when regenerating', () => {
    describe('with default configuration', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .doInDir(dir => {
            fse.copySync(getTemplatePath('default'), dir);
            fse.copySync(getEntityTemplatePath('Simple'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(getEntityTemplatePath('Simple2'), path.join(dir, '.jhipster/Bar.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true, singleEntity: true });
      });

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
      before(async () => {
        runResult = await helpers
          .run(getGenerator('entity'))
          .withGenerators([[MockedLanguagesGenerator, 'jhipster:languages']])
          .doInDir(dir => {
            createMockedConfig('05-cassandra', dir, { appDir: '' });
            fse.copySync(getEntityTemplatePath('Simple'), path.join(dir, '.jhipster/Foo.json'));
            fse.copySync(getEntityTemplatePath('Simple2'), path.join(dir, '.jhipster/Bar.json'));
          })
          .withArguments(['Foo'])
          .withOptions({ ...DEFAULT_TEST_OPTIONS, regenerate: true, force: true, singleEntity: true });
      });

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

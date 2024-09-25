import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import BaseApplicationGenerator from '../base-application/generator.js';

class MockedLanguagesGenerator extends BaseApplicationGenerator<any> {
  get [BaseApplicationGenerator.PREPARING]() {
    return {
      mockTranslations({ control }) {
        control.getWebappTranslation = () => 'translations';
      },
    };
  }
}

const entityFoo = { name: 'Foo', changelogDate: '20160926101210' };

describe('generator - entity database changelogs', () => {
  describe('when regenerating the entity', () => {
    describe('with cassandra database', () => {
      before(async () => {
        await helpers
          .runJHipster('entity')
          .withGenerators([[MockedLanguagesGenerator, { namespace: 'jhipster:languages' }]])
          .withJHipsterConfig({ databaseType: 'cassandra' }, [entityFoo])
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true, ignoreNeedlesError: true });
      });

      it('should create database changelog for the entity', () => {
        runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
      });
    });
    describe('with gateway application type', () => {
      before(async () => {
        await helpers
          .runJHipster('entity')
          .withGenerators([[MockedLanguagesGenerator, { namespace: 'jhipster:languages' }]])
          .withJHipsterConfig({ applicationType: 'gateway' }, [{ ...entityFoo, microserviceName: 'microservice1' }])
          .withArguments(['Foo'])
          .withOptions({ regenerate: true, force: true, ignoreNeedlesError: true });
      });

      it('should not create database changelogs', () => {
        runResult.assertNoFile([
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
        ]);
      });
    });
  });
});

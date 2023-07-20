import { defaultHelpers as helpers, result as runResult, getGenerator } from '../../test/support/index.mjs';
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';

const generator = getGenerator('spring-controller');

describe('generator - spring-controller', () => {
  describe('creates spring controller', () => {
    before(async () => {
      await helpers.run(generator).withJHipsterConfig().withArguments(['foo']).withAnswers({
        actionAdd: false,
      });
    });

    it('creates controller files', () => {
      runResult.assertFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

      runResult.assertFile([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
    });
  });

  describe('creates spring controller with --default flag', () => {
    before(async () => {
      await helpers.run(generator).withJHipsterConfig().withArguments(['foo']).withOptions({ default: true });
    });

    it('creates controller files', () => {
      runResult.assertFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

      runResult.assertFile([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
    });
  });

  describe('creates spring controller without packageFolde & non-default packageName in yo-rc.json', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(generator)
        .withJHipsterConfig({
          packageName: 'com.test',
        })
        .withArguments(['fooBar'])
        .withAnswers({
          actionAdd: false,
        });
    });

    it('creates fooBar controller files', () => {
      runResult.assertFile([`${SERVER_MAIN_SRC_DIR}com/test/web/rest/FooBarResource.java`]);
      runResult.assertFile([`${SERVER_TEST_SRC_DIR}com/test/web/rest/FooBarResourceIT.java`]);
    });
  });
});

import helpers from 'yeoman-test';

import EnvironmentBuilder from '../cli/environment-builder.mjs';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } from '../generators/generator-constants.mjs';

const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}spec/`;

const pageName = 'MyTestPage';
const pageFolderName = 'my-test-page';
const pageInstance = 'myTestPage';

const createClientProject = options =>
  helpers
    .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
    .withOptions({
      skipInstall: true,
      defaults: true,
      skipServer: true, // We don't need server for this test
      ...options,
    })
    .run();

const createPage = runResult =>
  runResult
    .create('jhipster:page', {}, { createEnv: EnvironmentBuilder.createEnv })
    .withOptions({
      skipInstall: true,
    })
    .withPrompts({
      pageName,
    })
    .run();

describe('Page subgenerator', () => {
  it.skip('with angular client framework');

  it.skip('with react client framework');

  describe('with vue client framework', () => {
    let runResult;
    const containsVueFiles = () => {
      it('creates expected files', () => {
        runResult.assertFile([
          `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.vue`,
          `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.service.ts`,
          `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.component.ts`,
          `${CLIENT_SPEC_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.component.spec.ts`,
          `${CLIENT_SPEC_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.service.spec.ts`,
        ]);
      });
      it('adds page path, service', () => {
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}/app/router/pages.ts`,
          `const ${pageName} = () => import('@/pages/${pageFolderName}/${pageFolderName}.vue');`
        );
        runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}/app/router/pages.ts`, `path: '/pages/${pageFolderName}',`);
        runResult.assertFileContent(
          `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
          `import ${pageName}Service from '@/pages/${pageFolderName}/${pageFolderName}.service';`
        );
        runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}/app/main.ts`, `${pageInstance}Service: () => new ${pageName}Service(),`);
      });
    };

    describe('creating a new page', () => {
      before(async () => {
        runResult = await createClientProject({ localConfig: { clientFramework: 'vue' } });
        runResult = await createPage(runResult);
      });

      containsVueFiles();
    });

    describe('regenerating an existing page', () => {
      before(async () => {
        runResult = await createClientProject({ localConfig: { clientFramework: 'vue', pages: [{ name: pageName }] } });
      });

      containsVueFiles();
    });
  });
});

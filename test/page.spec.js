const helpers = require('yeoman-test');

const EnvironmentBuilder = require('../cli/environment-builder');
const constants = require('../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}spec/`;

const pageName = 'MyTestPage';
const pageFolderName = 'my-test-page';
const pageInstance = 'myTestPage';

const createClientProject = options =>
  helpers
    .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
    .withOptions({
      fromCli: true,
      skipInstall: true,
      defaults: true,
      skipServer: true, // We don't need server for this test
      testFrameworks: ['protractor'],
      ...options,
    })
    .run();

const createPage = (cwd, options) =>
  helpers
    .create('jhipster:page', {}, { createEnv: EnvironmentBuilder.createEnv })
    .setDir(cwd)
    .withOptions({
      fromCli: true,
      skipInstall: true,
      ...options,
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
          `${CLIENT_TEST_SRC_DIR}e2e/pages/${pageFolderName}/${pageFolderName}.page-object.ts`,
          `${CLIENT_TEST_SRC_DIR}e2e/pages/${pageFolderName}/${pageFolderName}.spec.ts`,
        ]);
      });
      it('adds page path, service and protractor config', () => {
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
        runResult.assertFileContent(`${CLIENT_TEST_SRC_DIR}/protractor.conf.js`, "'./e2e/pages/**/*.spec.ts',");
      });
    };

    describe('creating a new page', () => {
      before(() => {
        return createClientProject({ localConfig: { clientFramework: 'vue' } })
          .then(result1 => createPage(result1.cwd))
          .then(result1 => {
            runResult = result1;
          });
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

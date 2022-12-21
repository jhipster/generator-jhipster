import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import constants from '../generators/generator-constants.cjs';
import { getGenerator, getTemplatePath } from './support/index.mjs';

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const generator = getGenerator('spring-controller');

describe('JHipster generator spring-controller', () => {
  describe('creates spring controller', () => {
    before(async () => {
      await helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withPrompts({
          actionAdd: false,
        });
    });

    it('creates controller files', () => {
      assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

      assert.file([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
    });
  });

  describe('creates spring controller with --default flag', () => {
    before(async () => {
      await helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withOptions({ default: true });
    });

    it('creates controller files', () => {
      assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

      assert.file([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
    });
  });

  describe('creates spring controller without packageFolde & non-default packageName in yo-rc.json', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(generator)
        .inTmpDir(dir => {
          const config = {
            ...fse.readJSONSync(getTemplatePath('default/.yo-rc.json'))[constants.GENERATOR_JHIPSTER],
            packageFolder: undefined,
            packageName: 'com.test',
          };
          fse.writeJsonSync(path.join(dir, '.yo-rc.json'), { [constants.GENERATOR_JHIPSTER]: config });
        })
        .withArguments(['fooBar'])
        .withPrompts({
          actionAdd: false,
        });
    });

    it('creates fooBar controller files', () => {
      runResult.assertFile([`${SERVER_MAIN_SRC_DIR}com/test/web/rest/FooBarResource.java`]);
      runResult.assertFile([`${SERVER_TEST_SRC_DIR}com/test/web/rest/FooBarResourceIT.java`]);
    });
  });
});

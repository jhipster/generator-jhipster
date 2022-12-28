import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import { SERVER_MAIN_SRC_DIR } from '../generators/generator-constants.mjs';
import { getGenerator, getTemplatePath } from './support/index.mjs';

const generator = getGenerator('spring-service');

describe('JHipster generator service', () => {
  describe('creates service without interface', () => {
    before(async () => {
      await helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withPrompts({
          useInterface: false,
        });
    });

    it('creates service file', () => {
      assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`]);
    });

    it('doesnt create interface', () => {
      assert.noFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`]);
    });
  });

  describe('creates service with interface', () => {
    before(async () => {
      await helpers
        .run(generator)
        .onTargetDirectory(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withPrompts({
          useInterface: true,
        });
    });

    it('creates service file', () => {
      assert.file([
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`,
      ]);
    });
  });

  describe('creates service with --default flag', () => {
    before(async () => {
      await helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withOptions({ default: true });
    });

    it('creates service file', () => {
      assert.file([
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`,
      ]);
    });
  });
});

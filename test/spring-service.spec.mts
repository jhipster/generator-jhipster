import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import constants from '../generators/generator-constants.cjs';
import { getGenerator, getTemplatePath } from './support/index.mjs';

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

const generator = getGenerator('spring-service');

describe('JHipster generator service', () => {
  describe('creates service without interface', () => {
    before(done => {
      helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withPrompts({
          useInterface: false,
        })
        .on('end', done);
    });

    it('creates service file', () => {
      assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`]);
    });

    it('doesnt create interface', () => {
      assert.noFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`]);
    });
  });

  describe('creates service with interface', () => {
    before(done => {
      helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withPrompts({
          useInterface: true,
        })
        .on('end', done);
    });

    it('creates service file', () => {
      assert.file([
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`,
      ]);
    });
  });

  describe('creates service with --default flag', () => {
    before(done => {
      helpers
        .run(generator)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('default'), dir);
        })
        .withArguments(['foo'])
        .withOptions({ default: true })
        .on('end', done);
    });

    it('creates service file', () => {
      assert.file([
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`,
      ]);
    });
  });
});

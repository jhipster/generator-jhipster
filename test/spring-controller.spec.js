/* global describe, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

describe('JHipster generator spring-controller', () => {
    describe('creates spring controller', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/spring-controller'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    actionAdd: false
                })
                .on('end', done);
        });

        it('creates controller files', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`
            ]);

            assert.file([
                `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIntTest.java`
            ]);
        });
    });

    describe('creates spring controller with --default flag', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/spring-controller'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ default: true })
                .on('end', done);
        });

        it('creates controller files', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`
            ]);

            assert.file([
                `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIntTest.java`
            ]);
        });
    });
});

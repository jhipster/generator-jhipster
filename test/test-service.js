/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const constants = require('../generators/generator-constants'),
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

describe('JHipster generator service', function () {
    describe('creates service without interface', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/service'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: false
                })
                .on('end', done);
        });

        it('creates service file', function () {
            assert.file([
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/FooService.java'
            ]);
        });

        it('doesnt create interface', function () {
            assert.noFile([
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });

    describe('creates service with interface', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/service'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: true
                })
                .on('end', done);
        });

        it('creates service file', function () {
            assert.file([
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/FooService.java',
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });
});

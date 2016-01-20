/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var fse = require('fs-extra');

describe('JHipster generator service', function () {
    describe('creates service without interface', function () {
        before(function (done) {
            helpers.run(require.resolve('../service'))
                .inTmpDir(function (dir) {
                  fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
                })
                .withArguments(['foo'])
                .withPrompts({
                    "useInterface": false
                })
                .on('end', done);
        });

        it('creates service file', function () {
            assert.file([
                'src/main/java/com/mycompany/myapp/service/FooService.java'
            ]);
        });

        it('doesnt create interface', function () {
            assert.noFile([
                'src/main/java/com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });

    describe('creates service with interface', function () {
        before(function (done) {
            helpers.run(require.resolve('../service'))
                .inTmpDir(function (dir) {
                  fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
                })
                .withArguments(['foo'])
                .withPrompts({
                    "useInterface": true
                })
                .on('end', done);
        });

        it('creates service file', function () {
            assert.file([
                'src/main/java/com/mycompany/myapp/service/FooService.java',
                'src/main/java/com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });
});

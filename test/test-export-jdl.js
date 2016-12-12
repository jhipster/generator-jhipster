/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

describe('JHipster generator export jdl', function () {
    describe('exports entities to a JDL file without argument', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/export-jdl'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/export-jdl'), dir);
                })
                .on('end', done);
        });

        it('creates the jdl file based on app name', function () {
            assert.file('standard.jh');
        });
    });

    describe('exports entities to a JDL file with file argument', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/export-jdl'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/export-jdl'), dir);
                })
                .withArguments('jdl.jdl')
                .on('end', done);
        });

        it('creates the jdl file', function () {
            assert.file('jdl.jdl');
        });
    });

});

/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

/*const constants = require('../generators/generator-constants'),
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;*/

describe('JHipster generator import jdl', function () {
    describe('imports a JDL model from single file', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['jdl.jdl'])
                .on('end', done);
        });

        it('creates entity json files', function () {
            assert.file([
                '.jhipster/department.json',
                '.jhipster/JobHistory.json',
                '.jhipster/Job.json',
                '.jhipster/Employee.json',
                '.jhipster/Location.json',
                '.jhipster/Task.json',
                '.jhipster/Country.json',
                '.jhipster/Region.json'
            ]);
        });
    });
});

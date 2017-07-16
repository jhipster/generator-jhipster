/* global describe, beforeEach, it*/


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

describe('JHipster generator import jdl', () => {
    describe('imports a JDL model from single file', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['jdl.jdl'])
                .on('end', done);
        });

        it('creates entity json files', () => {
            assert.file([
                '.jhipster/Department.json',
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

    describe('imports a JDL model from multiple files', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'])
                .on('end', done);
        });

        it('creates entity json files', () => {
            assert.file([
                '.jhipster/Department.json',
                '.jhipster/JobHistory.json',
                '.jhipster/Job.json',
                '.jhipster/Employee.json',
                '.jhipster/Location.json',
                '.jhipster/Task.json',
                '.jhipster/Country.json',
                '.jhipster/Region.json',
                '.jhipster/DepartmentAlt.json',
                '.jhipster/JobHistoryAlt.json',
                '.jhipster/Listing.json',
                '.jhipster/Profile.json',
                '.jhipster/WishList.json'

            ]);
        });
    });
});

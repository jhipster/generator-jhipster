/* global describe, before, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const entityFiles = [
    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Job.java`,
    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/JobRepository.java`,
    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/JobResource.java`,
    `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/JobResourceIntTest.java`,
];

describe('JHipster generator import jdl', () => {
    describe('imports a JDL model from single file with --json-only flag', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['jdl.jdl'])
                .withOptions({ 'json-only': true })
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
        it('does not create actual entity files', () => {
            assert.noFile(entityFiles);
        });
    });
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
        it('creates actual entity files', () => {
            assert.file(entityFiles);
        });
    });
    describe('imports JDL apps and entities', () => {
        before((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['apps-and-entities.jdl'])
                .on('end', done);
        });

        it('creates the applications', () => {
            assert.file([
                path.join('myFirstApp', '.yo-rc.json'),
                path.join('mySecondApp', '.yo-rc.json'),
                path.join('myThirdApp', '.yo-rc.json')
            ]);
        });
        it('creates the entities', () => {
            assert.file([
                path.join('myFirstApp', '.jhipster', 'A.json'),
                path.join('myFirstApp', '.jhipster', 'B.json'),
                path.join('myFirstApp', '.jhipster', 'E.json'),
                path.join('myFirstApp', '.jhipster', 'F.json'),
                path.join('mySecondApp', '.jhipster', 'E.json'),
                path.join('myThirdApp', '.jhipster', 'F.json')
            ]);
        });
    });
    describe('imports single app and entities', () => {
        before((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withOptions({ skipInstall: true })
                .withArguments(['single-app-and-entities.jdl'])
                .on('end', done);
        });

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
        });
        it('creates the entities', () => {
            assert.file([
                path.join('.jhipster', 'A.json'),
                path.join('.jhipster', 'B.json'),
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
        it('creates actual entity files', () => {
            assert.file(entityFiles);
        });
    });
    describe('imports a JDL model which excludes Elasticsearch for a class', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/import-jdl'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/import-jdl'), dir);
                })
                .withArguments(['search.jdl'])
                .on('end', done);
        });

        it('creates entity json files', () => {
            assert.file([
                '.jhipster/WithSearch.json',
                '.jhipster/WithoutSearch.json'
            ]);
            assert.fileContent('.jhipster/WithoutSearch.json', /"searchEngine": false/);
            assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/WithSearchSearchRepository.java`);
            assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/WithoutSearchSearchRepository.java`);
        });
    });
});

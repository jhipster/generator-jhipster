/* global describe, before, beforeEach, it, afterEach */

const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const expect = require('chai').expect;

const importJdl = require('../../cli/import-jdl');
const { testInTempDir } = require('../utils/utils');

let subGenCallParams = {};

const env = () => ({
    run(command, options, done) {
        subGenCallParams.count++;
        subGenCallParams.commands.push(command);
        subGenCallParams.options.push(options);
        done();
    }
});

describe('JHipster generator import jdl', () => {
    beforeEach(() => {
        subGenCallParams = {
            count: 0,
            commands: [],
            options: []
        };
    });
    describe('imports a JDL model from single file with --json-only flag', () => {
        beforeEach((done) => {
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl'], { 'json-only': true });
                done();
            });
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
        it('does not call entity sub generator', () => {
            expect(subGenCallParams.count).to.equal(0);
        });
    });
    describe('imports a JDL model from single file', () => {
        beforeEach((done) => {
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl'], {}, env());
                done();
            });
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
        it('calls entity subgenerator', () => {
            expect(subGenCallParams.count).to.equal(8);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:entity Region',
                'jhipster:entity Country',
                'jhipster:entity Location',
                'jhipster:entity Department',
                'jhipster:entity Task',
                'jhipster:entity Employee',
                'jhipster:entity Job',
                'jhipster:entity JobHistory'
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                regenerate: true,
                'from-cli': true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-user-management': undefined
            });
        });
    });
    describe('imports JDL apps and entities', () => {
        beforeEach((done) => {
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['apps-and-entities.jdl'], {}, env());
                done();
            });
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
        beforeEach((done) => {
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['single-app-and-entities.jdl'], { skipInstall: true }, env());
                done();
            });
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
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], {}, env());
                done();
            });
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
        it('calls entity subgenerator', () => {
            expect(subGenCallParams.count).to.equal(13);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:entity Region',
                'jhipster:entity Country',
                'jhipster:entity Location',
                'jhipster:entity Department',
                'jhipster:entity Task',
                'jhipster:entity Employee',
                'jhipster:entity Job',
                'jhipster:entity JobHistory',
                'jhipster:entity DepartmentAlt',
                'jhipster:entity JobHistoryAlt',
                'jhipster:entity WishList',
                'jhipster:entity Profile',
                'jhipster:entity Listing',
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                regenerate: true,
                'from-cli': true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-user-management': undefined
            });
        });
    });
    describe('imports a JDL model which excludes Elasticsearch for a class', () => {
        beforeEach((done) => {
            testInTempDir((dir) => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['search.jdl'], {}, env());
                done();
            });
        });

        it('creates entity json files', () => {
            assert.file([
                '.jhipster/WithSearch.json',
                '.jhipster/WithoutSearch.json'
            ]);
            assert.fileContent('.jhipster/WithoutSearch.json', /"searchEngine": false/);
        });
        it('calls entity subgenerator', () => {
            expect(subGenCallParams.count).to.equal(2);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:entity WithSearch',
                'jhipster:entity WithoutSearch'
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                regenerate: true,
                'from-cli': true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-user-management': undefined
            });
        });
    });
});

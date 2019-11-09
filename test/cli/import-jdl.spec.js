const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const expect = require('chai').expect;
const shelljs = require('shelljs');

const importJdl = require('../../cli/import-jdl');
const { testInTempDir } = require('../utils/utils');

let subGenCallParams = {
    count: 0,
    commands: [],
    options: []
};

const env = {
    run(command, options, done) {
        subGenCallParams.count++;
        subGenCallParams.commands.push(command);
        subGenCallParams.options.push(options);
        done();
    }
};

const mockFork = (done, tries) => (runYeomanProcess, argv, opts) => {
    const command = argv[0];
    const options = argv.slice(1);
    subGenCallParams.count++;
    subGenCallParams.commands.push(command);
    subGenCallParams.options.push(options);
    return {
        on(code, cb) {
            cb(0);
            if (done && subGenCallParams.count === tries) done();
        }
    };
};

function testDocumentsRelationships() {
    it('creates entity json files', () => {
        assert.file([
            '.jhipster/Customer.json',
            '.jhipster/CustomerOrder.json',
            '.jhipster/OrderedItem.json',
            '.jhipster/PaymentDetails.json',
            '.jhipster/ShippingDetails.json'
        ]);
    });
    it('calls entity subgenerator', () => {
        expect(subGenCallParams.count).to.equal(5);
        expect(subGenCallParams.commands).to.eql([
            'jhipster:entity Customer',
            'jhipster:entity CustomerOrder',
            'jhipster:entity OrderedItem',
            'jhipster:entity PaymentDetails',
            'jhipster:entity ShippingDetails'
        ]);
        expect(subGenCallParams.options[0]).to.eql({
            regenerate: true,
            force: false,
            interactive: true,
            'from-cli': true,
            'no-fluent-methods': undefined,
            'skip-client': undefined,
            'skip-install': true,
            'skip-server': undefined,
            'skip-ui-grouping': undefined,
            'skip-db-changelog': undefined,
            'skip-user-management': undefined
        });
    });
}

describe('JHipster generator import jdl', () => {
    beforeEach(() => {
        subGenCallParams = {
            count: 0,
            commands: [],
            options: []
        };
    });
    // this test for some reason works only when put at the beginning.
    describe('runs in series with --interactive flag', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['apps-and-entities-and-deployments.jdl'],
                    { skipInstall: true, noInsight: true, interactive: true },
                    env,
                    mockFork(done, 5)
                );
            });
        });
        it('calls generator in order', () => {
            expect(subGenCallParams.count).to.equal(5);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:app',
                'jhipster:app',
                'jhipster:app',
                'jhipster:docker-compose',
                'jhipster:kubernetes'
            ]);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--interactive',
                '--with-entities',
                '--from-cli'
            ]);
            expect(subGenCallParams.options[3]).to.eql(['--skip-prompts', '--skip-install', '--no-insight', '--interactive', '--from-cli']);
        });
    });

    describe('imports a JDL entity model from single file with --json-only flag', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl'], { 'json-only': true, skipInstall: true }, env);
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

    describe('imports a JDL entity model from single file with --skip-db-changelog', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl'], { 'skip-db-changelog': true, skipInstall: true }, env);
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
                force: false,
                skipInstall: true,
                'from-cli': true,
                interactive: true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-db-changelog': true,
                'skip-user-management': undefined
            });
        });
    });

    describe('imports a JDL entity model from single file in interactive mode by default', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl'], { skipInstall: true }, env);
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
                force: false,
                skipInstall: true,
                'from-cli': true,
                interactive: true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-db-changelog': undefined,
                'skip-user-management': undefined
            });
        });
    });

    describe('imports a JDL entity model from multiple files', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], { skipInstall: true }, env);
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
                'jhipster:entity Listing'
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                regenerate: true,
                force: false,
                skipInstall: true,
                'from-cli': true,
                interactive: true,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-db-changelog': undefined,
                'skip-user-management': undefined
            });
        });
    });

    describe('imports a JDL entity model which excludes Elasticsearch for a class', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['search.jdl'], { skipInstall: true, interactive: false }, env);
                done();
            });
        });

        it('creates entity json files', () => {
            assert.file(['.jhipster/WithSearch.json', '.jhipster/WithoutSearch.json']);
            assert.fileContent('.jhipster/WithoutSearch.json', /"searchEngine": false/);
        });
        it('calls entity subgenerator', () => {
            expect(subGenCallParams.count).to.equal(2);
            expect(subGenCallParams.commands).to.eql(['jhipster:entity WithSearch', 'jhipster:entity WithoutSearch']);
            expect(subGenCallParams.options[0]).to.eql({
                regenerate: true,
                force: true,
                skipInstall: true,
                'from-cli': true,
                interactive: false,
                'no-fluent-methods': undefined,
                'skip-client': undefined,
                'skip-install': true,
                'skip-server': undefined,
                'skip-ui-grouping': undefined,
                'skip-db-changelog': undefined,
                'skip-user-management': undefined
            });
        });
    });

    describe('imports single app and entities', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['single-app-and-entities.jdl'],
                    { skipInstall: true, noInsight: true, 'skip-git': false },
                    env,
                    mockFork(done, 1)
                );
            });
        });

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
        });
        it('creates the entities', () => {
            assert.file([path.join('.jhipster', 'A.json'), path.join('.jhipster', 'B.json')]);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--no-skip-git',
                '--with-entities',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('imports single app and entities passed with --inline', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                importJdl(
                    [],
                    {
                        skipInstall: true,
                        noInsight: true,
                        'skip-git': false,
                        inline: 'application { config { baseName jhapp } entities * } entity Customer'
                    },
                    env,
                    mockFork(done, 1)
                );
            });
        });

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
        });
        it('creates the entities', () => {
            assert.file([path.join('.jhipster', 'Customer.json')]);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--no-skip-git',
                '--inline',
                'application',
                '{',
                'config',
                'baseName',
                'jhapp',
                '}',
                'entities',
                '*',
                'entity',
                'Customer',
                '--with-entities',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('imports single app only', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['single-app-only.jdl'],
                    { skipInstall: true, noInsight: true, interactive: false, 'skip-git': false },
                    env,
                    mockFork(done, 1)
                );
            });
        });

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--no-interactive',
                '--no-skip-git',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('imports multiple JDL apps and entities', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['apps-and-entities.jdl'],
                    { skipInstall: true, noInsight: true, interactive: false, 'skip-git': false },
                    env,
                    mockFork(done, 3)
                );
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
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(3);
            expect(subGenCallParams.commands).to.eql(['jhipster:app', 'jhipster:app', 'jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--no-interactive',
                '--no-skip-git',
                '--with-entities',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('skips JDL apps with --ignore-application', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['apps-and-entities.jdl'],
                    { skipInstall: true, 'ignore-application': true, interactive: false, 'skip-git': false },
                    env,
                    mockFork(done, 6)
                );
            });
        });

        it('creates the application config', () => {
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
        it('does not call application generator', () => {
            expect(subGenCallParams.count).to.equal(6);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:entity A',
                'jhipster:entity B',
                'jhipster:entity E',
                'jhipster:entity E',
                'jhipster:entity F',
                'jhipster:entity F'
            ]);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--ignore-application',
                '--no-interactive',
                '--no-skip-git',
                '--regenerate',
                '--from-cli',
                '--force'
            ]);
        });
    });

    describe('imports JDL deployments only', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                importJdl(['deployments.jdl'], { skipInstall: true, interactive: false, 'skip-git': false }, env, mockFork(done, 3));
            });
        });

        it('creates the deployments', () => {
            assert.file([
                path.join('docker-compose', '.yo-rc.json'),
                path.join('kubernetes', '.yo-rc.json'),
                path.join('openshift', '.yo-rc.json')
            ]);
        });
        it('calls deployment generator', () => {
            const invokedSubgens = ['jhipster:docker-compose', 'jhipster:kubernetes', 'jhipster:openshift'];
            expect(subGenCallParams.commands).to.eql(invokedSubgens);
            expect(subGenCallParams.count).to.equal(invokedSubgens.length);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-prompts',
                '--skip-install',
                '--no-interactive',
                '--no-skip-git',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('imports multiple JDL apps, deployments and entities', () => {
        describe('calls generators', () => {
            beforeEach(done => {
                testInTempDir(dir => {
                    fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                    shelljs.rm(`${dir}/.yo-rc.json`);
                    importJdl(
                        ['apps-and-entities-and-deployments.jdl'],
                        { skipInstall: true, noInsight: true, interactive: false, 'skip-git': false },
                        env,
                        mockFork(done, 5)
                    );
                });
            });
            it('calls generator in order', () => {
                expect(subGenCallParams.count).to.equal(5);
                expect(subGenCallParams.commands).to.eql([
                    'jhipster:app',
                    'jhipster:app',
                    'jhipster:app',
                    'jhipster:docker-compose',
                    'jhipster:kubernetes'
                ]);
                expect(subGenCallParams.options[0]).to.eql([
                    '--skip-install',
                    '--no-insight',
                    '--no-interactive',
                    '--no-skip-git',
                    '--with-entities',
                    '--force',
                    '--from-cli'
                ]);
                expect(subGenCallParams.options[3]).to.eql([
                    '--skip-prompts',
                    '--skip-install',
                    '--no-insight',
                    '--no-interactive',
                    '--no-skip-git',
                    '--force',
                    '--from-cli'
                ]);
            });
        });
        describe('creates config files', () => {
            beforeEach(done => {
                testInTempDir(dir => {
                    fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                    shelljs.rm(`${dir}/.yo-rc.json`);
                    importJdl(['apps-and-entities-and-deployments.jdl'], { skipInstall: true }, env, mockFork());
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
            it('creates the deployments', () => {
                assert.file([path.join('docker-compose', '.yo-rc.json'), path.join('kubernetes', '.yo-rc.json')]);
            });
        });
    });

    describe('skips JDL deployments with --skip-deployments flag', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                shelljs.rm(`${dir}/.yo-rc.json`);
                importJdl(
                    ['apps-and-entities-and-deployments.jdl'],
                    { skipInstall: true, noInsight: true, 'skip-deployments': true, interactive: false, 'skip-git': false },
                    env,
                    mockFork(done, 3)
                );
            });
        });
        it('calls generator in order', () => {
            expect(subGenCallParams.count).to.equal(3);
            expect(subGenCallParams.commands).to.eql(['jhipster:app', 'jhipster:app', 'jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--no-insight',
                '--skip-deployments',
                '--no-interactive',
                '--no-skip-git',
                '--with-entities',
                '--force',
                '--from-cli'
            ]);
        });
    });

    describe('imports a JDL entity model with relations for mongodb', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/documents-with-relations'), dir);
                fse.copySync(path.join(__dirname, '../templates/mongodb-with-relations'), dir);
                importJdl(['orders-model.jdl'], {}, env);
                done();
            });
        });

        testDocumentsRelationships();
    });

    describe('imports a JDL entity model with relations for couchbase', () => {
        beforeEach(done => {
            testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/documents-with-relations'), dir);
                fse.copySync(path.join(__dirname, '../templates/couchbase-with-relations'), dir);
                importJdl(['orders-model.jdl'], {}, env);
                done();
            });
        });

        testDocumentsRelationships();
    });
});

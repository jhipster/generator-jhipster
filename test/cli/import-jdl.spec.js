const path = require('path');
const proxyquire = require('proxyquire');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const expect = require('chai').expect;
const utils = require('../../cli/utils');

const { testInTempDir, revertTempDir } = require('../utils/utils');

let subGenCallParams = {
    count: 0,
    commands: [],
    options: [],
};

const removeFieldsWithUndefinedValues = options => Object.fromEntries(Object.entries(options).filter(([_, value]) => value !== undefined));

const pushCall = (command, options) => {
    subGenCallParams.count++;
    subGenCallParams.commands.push(command);
    if (!Array.isArray(options)) {
        options = removeFieldsWithUndefinedValues(options);
    }
    subGenCallParams.options.push(options);
};

const env = {
    run(command, options) {
        pushCall(command, options);
        return Promise.resolve();
    },
};

const loadImportJdl = options => {
    options = {
        './utils': {
            ...utils,
            logger: {
                ...utils.logger,
                info: () => {},
            },
            printSuccess: () => {},
        },
        child_process: {
            fork: (runYeomanProcess, argv, opts) => {
                const command = argv[0];
                const options = argv.slice(1);
                pushCall(command, options);
                return {
                    on(code, cb) {
                        cb(0);
                    },
                };
            },
        },
        './environment-builder': {
            createDefaultBuilder: () => {
                return {
                    getEnvironment: () => {
                        return {
                            run: (generatorArgs, generatorOptions) => {
                                pushCall(generatorArgs, generatorOptions);
                                return Promise.resolve();
                            },
                        };
                    },
                };
            },
        },
        ...options,
    };
    return proxyquire('../../cli/import-jdl', options);
};

const defaultAddedOptions = {
    fromCli: true,
    localConfigOnly: true,
};

function testDocumentsRelationships() {
    it('creates entity json files', () => {
        assert.file([
            '.jhipster/Customer.json',
            '.jhipster/CustomerOrder.json',
            '.jhipster/OrderedItem.json',
            '.jhipster/PaymentDetails.json',
            '.jhipster/ShippingDetails.json',
        ]);
    });
    it('calls entity subgenerator', () => {
        expect(subGenCallParams.count).to.equal(5);
        expect(subGenCallParams.commands).to.eql([
            'jhipster:entity Customer',
            'jhipster:entity CustomerOrder',
            'jhipster:entity OrderedItem',
            'jhipster:entity PaymentDetails',
            'jhipster:entity ShippingDetails',
        ]);
        expect(subGenCallParams.options[0]).to.eql({
            ...defaultAddedOptions,
            regenerate: true,
            interactive: true,
            skipInstall: true,
        });
    });
}

describe('JHipster generator import jdl', () => {
    let originalCwd;
    before(() => {
        originalCwd = process.cwd();
    });
    beforeEach(() => {
        subGenCallParams = {
            count: 0,
            commands: [],
            options: [],
        };
    });
    afterEach(() => {
        process.chdir(originalCwd);
    });
    // this test for some reason works only when put at the beginning.
    describe('runs in series with --interactive flag', () => {
        const options = { skipInstall: true, noInsight: true, interactive: true };
        beforeEach(() => {
            return testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['apps-and-entities-and-deployments.jdl'], options, env);
            });
        });
        it('calls generator in order', () => {
            expect(subGenCallParams.count).to.equal(5);
            expect(subGenCallParams.commands).to.eql([
                'jhipster:app',
                'jhipster:app',
                'jhipster:app',
                'jhipster:docker-compose',
                'jhipster:kubernetes',
            ]);
            expect(subGenCallParams.options[0]).to.eql([
                '--with-entities',
                '--skip-install',
                '--no-insight',
                '--interactive',
                '--from-cli',
                '--local-config-only',
            ]);
            expect(subGenCallParams.options[3]).to.eql([
                '--skip-install',
                '--no-insight',
                '--interactive',
                '--skip-prompts',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports a JDL entity model from single file with --json-only flag', () => {
        let oldCwd;
        const options = { jsonOnly: true, skipInstall: true };
        beforeEach(() => {
            return testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['jdl.jdl'], options, env);
            }, true).then(cwd => {
                oldCwd = cwd;
            });
        });

        afterEach(() => revertTempDir(oldCwd));

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
            ]);
        });
        it('does not call entity sub generator', () => {
            expect(subGenCallParams.count).to.equal(0);
        });
    });

    describe('imports a JDL entity model from single file with --skip-db-changelog', () => {
        let oldCwd;
        const options = { skipDbChangelog: true, skipInstall: true };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['jdl.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

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
                'jhipster:entity JobHistory',
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                ...options,
                ...defaultAddedOptions,
                regenerate: true,
                interactive: true,
            });
        });
    });

    describe('imports a JDL entity model from single file in interactive mode by default', () => {
        let oldCwd;
        const options = { skipInstall: true };
        beforeEach(() => {
            return testInTempDir(dir => {
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['jdl.jdl'], options, env);
            }, true).then(cwd => {
                oldCwd = cwd;
            });
        });

        afterEach(() => revertTempDir(oldCwd));

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
                'jhipster:entity JobHistory',
            ]);
            expect(subGenCallParams.options[0]).to.eql({
                ...options,
                ...defaultAddedOptions,
                regenerate: true,
                interactive: true,
            });
        });
    });

    describe('imports a JDL entity model from multiple files', () => {
        let oldCwd;
        const options = { skipInstall: true };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

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
                '.jhipster/WishList.json',
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
                ...options,
                ...defaultAddedOptions,
                regenerate: true,
                interactive: true,
            });
        });
    });

    describe('imports a JDL entity model which excludes Elasticsearch for a class', () => {
        let oldCwd;
        const options = { skipInstall: true, interactive: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['search.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates entity json files', () => {
            assert.file(['.jhipster/WithSearch.json', '.jhipster/WithoutSearch.json']);
            assert.fileContent('.jhipster/WithoutSearch.json', /"searchEngine": false/);
        });
        it('calls entity subgenerator', () => {
            expect(subGenCallParams.count).to.equal(2);
            expect(subGenCallParams.commands).to.eql(['jhipster:entity WithSearch', 'jhipster:entity WithoutSearch']);
            expect(subGenCallParams.options[0]).to.eql({
                ...options,
                ...defaultAddedOptions,
                regenerate: true,
                force: true,
            });
        });
    });

    describe('imports single app and entities with --fork', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, skipGit: false, creationTimestamp: '2019-01-01' };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['single-app-and-entities.jdl'], { ...options, fork: true }, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
            assert.JSONFileContent('.yo-rc.json', {
                'generator-jhipster': { baseName: 'jhipsterApp' },
            });
            assert.JSONFileContent('.yo-rc.json', {
                'generator-jhipster': { creationTimestamp: 1546300800000 },
            });
        });
        it('creates the entities', () => {
            const aFile = path.join('.jhipster', 'A.json');
            assert.file([aFile, path.join('.jhipster', 'B.json')]);
            assert.JSONFileContent(aFile, {
                changelogDate: '20190101000100',
            });
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--force',
                '--with-entities',
                '--skip-install',
                '--no-insight',
                '--no-skip-git',
                '--creation-timestamp',
                '2019-01-01',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports single app and entities', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, skipGit: false, creationTimestamp: '2019-01-01' };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['single-app-and-entities.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('should not create .yo-rc.json', () => {
            assert.noFile(['.yo-rc.json']);
        });
        it('should not create entity files', () => {
            const aFile = path.join('.jhipster', 'A.json');
            assert.noFile([aFile, path.join('.jhipster', 'B.json')]);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
            expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
                ...options,
                ...defaultAddedOptions,
                withEntities: true,
                force: true,
                localConfigOnly: true,
                applicationWithEntities: undefined,
            });
        });
    });

    describe('imports single app and entities passed with --inline and --fork', () => {
        let oldCwd;
        const options = {
            skipInstall: true,
            noInsight: true,
            skipGit: false,
            inline: 'application { config { baseName jhapp } entities * } entity Customer',
        };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                return loadImportJdl()([], { ...options, fork: true }, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

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
                '--force',
                '--with-entities',
                '--skip-install',
                '--no-insight',
                '--no-skip-git',
                '--inline',
                'application { config { baseName jhapp } entities * } entity Customer',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports single app and entities passed with --inline', () => {
        let oldCwd;
        const options = {
            skipInstall: true,
            noInsight: true,
            skipGit: false,
            inline: 'application { config { baseName jhapp } entities * } entity Customer',
        };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                return loadImportJdl()([], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('should not create .yo-rc.json', () => {
            assert.noFile(['.yo-rc.json']);
        });
        it('should not create entity files', () => {
            assert.noFile([path.join('.jhipster', 'Customer.json')]);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
            expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
                ...options,
                ...defaultAddedOptions,
                withEntities: true,
                force: true,
                localConfigOnly: true,
                applicationWithEntities: undefined,
            });
        });
    });

    describe('imports single app only with --fork', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['single-app-only.jdl'], { ...options, fork: true }, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates the application', () => {
            assert.file(['.yo-rc.json']);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--force',
                '--skip-install',
                '--no-insight',
                '--no-interactive',
                '--no-skip-git',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports single app only', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['single-app-only.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('should not create .yo-rc.json', () => {
            assert.noFile(['.yo-rc.json']);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:app']);
            expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
            expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
                ...options,
                ...defaultAddedOptions,
                force: true,
                localConfigOnly: true,
                applicationWithEntities: undefined,
            });
        });
    });

    describe('imports multiple JDL apps and entities', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['apps-and-entities.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates the applications', () => {
            assert.file([
                path.join('myFirstApp', '.yo-rc.json'),
                path.join('mySecondApp', '.yo-rc.json'),
                path.join('myThirdApp', '.yo-rc.json'),
            ]);
        });
        it('creates the entities', () => {
            assert.file([
                path.join('myFirstApp', '.jhipster', 'A.json'),
                path.join('myFirstApp', '.jhipster', 'B.json'),
                path.join('myFirstApp', '.jhipster', 'E.json'),
                path.join('myFirstApp', '.jhipster', 'F.json'),
                path.join('mySecondApp', '.jhipster', 'E.json'),
                path.join('myThirdApp', '.jhipster', 'F.json'),
            ]);
        });
        it('calls application generator', () => {
            expect(subGenCallParams.count).to.equal(3);
            expect(subGenCallParams.commands).to.eql(['jhipster:app', 'jhipster:app', 'jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--force',
                '--with-entities',
                '--skip-install',
                '--no-insight',
                '--no-interactive',
                '--no-skip-git',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('skips JDL apps with --ignore-application', () => {
        let oldCwd;
        const options = { skipInstall: true, ignoreApplication: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['apps-and-entities.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates the application config', () => {
            assert.file([
                path.join('myFirstApp', '.yo-rc.json'),
                path.join('mySecondApp', '.yo-rc.json'),
                path.join('myThirdApp', '.yo-rc.json'),
            ]);
        });
        it('creates the entities', () => {
            assert.file([
                path.join('myFirstApp', '.jhipster', 'A.json'),
                path.join('myFirstApp', '.jhipster', 'B.json'),
                path.join('myFirstApp', '.jhipster', 'E.json'),
                path.join('myFirstApp', '.jhipster', 'F.json'),
                path.join('mySecondApp', '.jhipster', 'E.json'),
                path.join('myThirdApp', '.jhipster', 'F.json'),
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
                'jhipster:entity F',
            ]);
            expect(subGenCallParams.options[0]).to.eql([
                '--skip-install',
                '--force',
                '--ignore-application',
                '--no-interactive',
                '--no-skip-git',
                '--regenerate',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports JDL deployments only', () => {
        let oldCwd;
        const options = { skipInstall: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                return loadImportJdl()(['deployments.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('creates the deployments', () => {
            assert.file([
                path.join('docker-compose', '.yo-rc.json'),
                path.join('kubernetes', '.yo-rc.json'),
                path.join('openshift', '.yo-rc.json'),
            ]);
        });
        it('calls deployment generator', () => {
            const invokedSubgens = ['jhipster:docker-compose', 'jhipster:kubernetes', 'jhipster:openshift'];
            expect(subGenCallParams.commands).to.eql(invokedSubgens);
            expect(subGenCallParams.count).to.equal(invokedSubgens.length);
            expect(subGenCallParams.options[0]).to.eql([
                '--force',
                '--skip-install',
                '--no-interactive',
                '--no-skip-git',
                '--skip-prompts',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports multiple JDL apps, deployments and entities', () => {
        describe('calls generators', () => {
            let oldCwd;
            const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
            beforeEach(() => {
                return testInTempDir(dir => {
                    oldCwd = dir;
                    fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                    fse.removeSync(`${dir}/.yo-rc.json`);
                    return loadImportJdl()(['apps-and-entities-and-deployments.jdl'], options, env);
                }, true);
            });

            afterEach(() => revertTempDir(oldCwd));

            it('calls generator in order', () => {
                expect(subGenCallParams.count).to.equal(5);
                expect(subGenCallParams.commands).to.eql([
                    'jhipster:app',
                    'jhipster:app',
                    'jhipster:app',
                    'jhipster:docker-compose',
                    'jhipster:kubernetes',
                ]);
                expect(subGenCallParams.options[0]).to.eql([
                    '--force',
                    '--with-entities',
                    '--skip-install',
                    '--no-insight',
                    '--no-interactive',
                    '--no-skip-git',
                    '--from-cli',
                    '--local-config-only',
                ]);
                expect(subGenCallParams.options[3]).to.eql([
                    '--force',
                    '--skip-install',
                    '--no-insight',
                    '--no-interactive',
                    '--no-skip-git',
                    '--skip-prompts',
                    '--from-cli',
                    '--local-config-only',
                ]);
            });
        });
        describe('creates config files', () => {
            let oldCwd;
            const options = { skipInstall: true };
            beforeEach(() => {
                return testInTempDir(dir => {
                    oldCwd = dir;
                    fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                    fse.removeSync(`${dir}/.yo-rc.json`);
                    return loadImportJdl()(['apps-and-entities-and-deployments.jdl'], options, env);
                }, true);
            });

            afterEach(() => revertTempDir(oldCwd));

            it('creates the applications', () => {
                assert.file([
                    path.join('myFirstApp', '.yo-rc.json'),
                    path.join('mySecondApp', '.yo-rc.json'),
                    path.join('myThirdApp', '.yo-rc.json'),
                ]);
            });
            it('creates the entities', () => {
                assert.file([
                    path.join('myFirstApp', '.jhipster', 'A.json'),
                    path.join('myFirstApp', '.jhipster', 'B.json'),
                    path.join('myFirstApp', '.jhipster', 'E.json'),
                    path.join('myFirstApp', '.jhipster', 'F.json'),
                    path.join('mySecondApp', '.jhipster', 'E.json'),
                    path.join('myThirdApp', '.jhipster', 'F.json'),
                ]);
            });
            it('creates the deployments', () => {
                assert.file([path.join('docker-compose', '.yo-rc.json'), path.join('kubernetes', '.yo-rc.json')]);
            });
        });
    });

    describe('skips JDL deployments with --ignore-deployments flag', () => {
        let oldCwd;
        const options = { skipInstall: true, noInsight: true, ignoreDeployments: true, interactive: false, skipGit: false };
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/import-jdl'), dir);
                fse.removeSync(`${dir}/.yo-rc.json`);
                return loadImportJdl()(['apps-and-entities-and-deployments.jdl'], options, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        it('calls generator in order', () => {
            expect(subGenCallParams.count).to.equal(3);
            expect(subGenCallParams.commands).to.eql(['jhipster:app', 'jhipster:app', 'jhipster:app']);
            expect(subGenCallParams.options[0]).to.eql([
                '--force',
                '--with-entities',
                '--skip-install',
                '--no-insight',
                '--ignore-deployments',
                '--no-interactive',
                '--no-skip-git',
                '--from-cli',
                '--local-config-only',
            ]);
        });
    });

    describe('imports a JDL entity model with relations for mongodb', () => {
        let oldCwd;
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/documents-with-relations'), dir);
                fse.copySync(path.join(__dirname, '../templates/mongodb-with-relations'), dir);
                return loadImportJdl()(['orders-model.jdl'], {}, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        testDocumentsRelationships();
    });

    describe('imports a JDL entity model with relations for couchbase', () => {
        let oldCwd;
        beforeEach(() => {
            return testInTempDir(dir => {
                oldCwd = dir;
                fse.copySync(path.join(__dirname, '../templates/documents-with-relations'), dir);
                fse.copySync(path.join(__dirname, '../templates/couchbase-with-relations'), dir);
                return loadImportJdl()(['orders-model.jdl'], {}, env);
            }, true);
        });

        afterEach(() => revertTempDir(oldCwd));

        testDocumentsRelationships();
    });
});

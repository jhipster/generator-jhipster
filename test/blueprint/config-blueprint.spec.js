const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;
const ConfigGenerator = require('../../generators/config');

const mockBlueprintSubGen = class extends ConfigGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};

        this.generatorSource.skipInsightPrompt = false;
        this.generatorSource.skipApplicationTypePrompt = false;
        this.generatorSource.skipModuleNamePrompt = false;
        this.generatorSource.skipI18n = false;
        this.generatorSource.skipTestOptsPrompt = true;
        this.generatorSource.skipMoreModulesPrompt = false;
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        const phaseFromJHipster = super._prompting();
        const customPhaseSteps = {
            overrideBase() {
                assert.equal(this.generatorSource.baseName, 'originalJhipster');
                this.generatorSource.baseName = 'jhipster';
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }

    get configuring() {
        const phaseFromJHipster = super._configuring();
        const customPhaseSteps = {
            overrideTest() {
                assert.equal(this.generatorSource.testFrameworks, undefined);
                this.generatorSource.testFrameworks = ['protractor'];
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }

    get default() {
        return super._default();
    }

    get writing() {
        return super._writing();
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster config generator with blueprint', () => {
    describe('generate common with blueprint', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprint: 'myblueprint',
                    experimental: true
                })
                .withPrompts({
                    // Will be replace by jhipster.
                    baseName: 'originalJhipster',
                    // Will be ignored.
                    testFrameworks: ['gatling', 'protractor'],

                    clientFramework: 'angularX',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    skipClient: false,
                    skipUserManagement: false,
                    serverSideOptions: []
                })
                .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:config']])
                .on('end', done);
        });

        it('creates expected default files for angularX', () => {
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.userManagementServer);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.dockerServices);
            assert.file(expectedFiles.mysql);
            assert.file(expectedFiles.hibernateTimeZoneConfig);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: ['protractor']
                })
            );
        });

        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('.yo-rc.json', /jhipster/);
            assert.JSONFileContent('.yo-rc.json', {
                'generator-jhipster': { baseName: 'jhipster', testFrameworks: ['protractor'] }
            });
        });
    });
});

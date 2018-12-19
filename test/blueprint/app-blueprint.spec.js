const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const CommonGenerator = require('../../generators/common');
const ServerGenerator = require('../../generators/server');
const ClientGenerator = require('../../generators/client');
const createBlueprintMockForSubgen = require('../utils/utils').createBlueprintMockForSubgen;
const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;

describe('JHipster application generator with blueprint', () => {
    describe('generate monolith application with blueprint', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: 'generator-jhipster-myblueprint',
                        version: '9.9.9'
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprint: 'myblueprint'
                })
                .withPrompts({
                    baseName: 'jhipster',
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
                    useSass: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr']
                })
                .withGenerators([
                    [helpers.createDummyGenerator(), 'jhipster-myblueprint:'],
                    [createBlueprintMockForSubgen(CommonGenerator), 'jhipster-myblueprint:common'],
                    [createBlueprintMockForSubgen(ServerGenerator), 'jhipster-myblueprint:server'],
                    [createBlueprintMockForSubgen(ClientGenerator), 'jhipster-myblueprint:client']
                ])
                .on('end', done);
        });

        it('creates expected default files for server and angularX', () => {
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(
                getFilesForOptions(angularFiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                })
            );
        });

        it('blueprint version is saved in .yo-rc.json', () => {
            assert.fileContent('.yo-rc.json', /"blueprintVersion": "9.9.9"/);
        });
        it('blueprint module and version are in package.json', () => {
            assert.fileContent('package.json', /"generator-jhipster-myblueprint": "9.9.9"/);
        });
    });
});

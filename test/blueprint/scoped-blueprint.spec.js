const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;

describe('JHipster application generator with scoped blueprint', () => {
    describe('generate monolith application with scoped blueprint', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: '@jhipster/generator-jhipster-scoped-blueprint',
                        version: '9.9.9'
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/@jhipster/generator-jhipster-scoped-blueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprint: '@jhipster/generator-jhipster-scoped-blueprint'
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
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr']
                })
                .on('end', done);
        });

        it('creates expected default files for server and angularX', () => {
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                })
            );
        });

        it('blueprint version is saved in .yo-rc.json', () => {
            assert.JSONFileContent('.yo-rc.json', {
                'generator-jhipster': { blueprints: [{ name: '@jhipster/generator-jhipster-scoped-blueprint', version: '9.9.9' }] }
            });
        });
        it('blueprint module and version are in package.json', () => {
            assert.fileContent('package.json', /"@jhipster\/generator-jhipster-scoped-blueprint": "9.9.9"/);
        });
    });
});

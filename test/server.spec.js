const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const angularfiles = require('../generators/client/files-angular').files;

describe('JHipster server generator', () => {
    describe('generate server with ehcache', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/server'))
                .withOptions({ skipInstall: true, skipChecks: true })
                .withPrompts({
                    baseName: 'jhipster',
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
                    serverSideOptions: []
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for server generator', () => {
            assert.noFile(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.userManagementServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.mysql);
            assert.file(expectedFiles.hibernateTimeZoneConfig);
            assert.noFile(
                getFilesForOptions(
                    angularfiles,
                    {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    },
                    null,
                    ['package.json']
                )
            );
        });
    });

    describe('generate server with caffeine', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/server'))
                .withOptions({ skipInstall: true, skipChecks: true })
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'caffeine',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: []
                })
                .on('end', done);
        });

        it('creates expected files for caffeine cache configuration for server generator', () => {
            assert.noFile(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.userManagementServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.mysql);
            assert.file(expectedFiles.hibernateTimeZoneConfig);
            assert.noFile(
                getFilesForOptions(
                    angularfiles,
                    {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    },
                    null,
                    ['package.json']
                )
            );
        });
    });
});

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('./utils/expected-files');
const constants = require('../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

describe('JHipster client generator', () => {
    describe('generate cypress with React client with JWT', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: REACT,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for React configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressNoOAuth2);
            assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
        });
    });

    describe('generate cypress with React client with OAuth2', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'oauth2',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: REACT,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for React configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressWithOauth2);
        });
    });

    describe('generate cypress with Angular client with JWT', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: ANGULAR,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for Angular configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressNoOAuth2);
            assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
        });
    });

    describe('generate cypress with Angular client with OAuth2', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'oauth2',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: ANGULAR,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for Angular configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressWithOauth2);
        });
    });

    describe('generate cypress with Vue client with JWT', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: VUE,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for Vue configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressNoOAuth2);
            assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
        });
    });

    describe('generate cypress with Vue client with OAuth2', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                })
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'oauth2',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['cypress'],
                    buildTool: 'maven',
                    clientFramework: VUE,
                    clientTheme: 'none',
                })
                .on('end', done);
        });

        it('contains testFrameworks with cypress value', () => {
            assert.fileContent('.yo-rc.json', /"testFrameworks": \["cypress"\]/);
        });

        it('creates expected files for Vue configuration for cypress generator', () => {
            assert.file(expectedFiles.cypress);
            assert.file(expectedFiles.cypressWithOauth2);
        });
    });
});

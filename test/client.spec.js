/* global describe, context, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const angularJsfiles = require('../generators/client/files-angularjs').files;
const angularfiles = require('../generators/client/files-angular').files;

describe('JHipster client generator', () => {
    describe('generate client with angularjs 1', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt' })
                .withPrompts({
                    baseName: 'jhipster',
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: 'angular1',
                    useSass: true
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client generator', () => {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(getFilesForOptions(angularJsfiles, {
                useSass: true,
                enableTranslation: true,
                serviceDiscoveryType: false,
                authenticationType: 'jwt',
                testFrameworks: []
            }));
        });
        it('contains clientFramework with angular1 value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angular1"/);
        });
        it('contains clientPackageManager with yarn value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "yarn"/);
        });
    });

    describe('generate client with AngularJS 1 using npm flag', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'session', npm: true })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: 'angular1',
                    useSass: true
                })
                .on('end', done);
        });
        it('contains clientFramework with angular1 value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angular1"/);
        });
        it('contains clientPackageManager with npm value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
        });
    });

    describe('generate client with Angular 2+', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt' })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: 'angularX',
                    useSass: true
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client generator', () => {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.i18nJson);
            assert.file(getFilesForOptions(angularfiles, {
                useSass: true,
                enableTranslation: true,
                serviceDiscoveryType: false,
                authenticationType: 'jwt',
                testFrameworks: []
            }));
        });
        it('contains clientFramework with angularX value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
        });
        it('contains clientPackageManager with yarn value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "yarn"/);
        });
    });

    describe('generate client with Angular 2+ using yarn flag', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt', npm: true })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: 'angularX',
                    useSass: true
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client-2 generator', () => {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.i18nJson);
            assert.file(getFilesForOptions(angularfiles, {
                useSass: true,
                enableTranslation: true,
                serviceDiscoveryType: false,
                authenticationType: 'jwt',
                testFrameworks: []
            }));
        });
        it('contains clientFramework with angularX value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
        });
        it('contains clientPackageManager with npm value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
        });
    });
});

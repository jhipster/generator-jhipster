const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const angularFiles = require('../generators/client/files-angular').files;
const reactFiles = require('../generators/client/files-react').files;
const constants = require('../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

describe('JHipster client generator', () => {
    describe('generate client with React', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt', experimental: true })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: REACT,
                })
                .on('end', done);
        });
        it('creates expected files for react configuration for client generator', () => {
            assert.noFile(expectedFiles.maven);
            assert.file(
                getFilesForOptions(reactFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                })
            );
        });
        it('contains clientFramework with react value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
        });
    });

    describe('generate client with Angular', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt' })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: ANGULAR,
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client generator', () => {
            assert.noFile(expectedFiles.common);
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.i18nJson);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                })
            );
        });
        it('contains clientFramework with angularX value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
        });
        it('contains clientPackageManager with npm value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
        });
    });
});

/* global describe, context, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const angularfiles = require('../generators/client/files-angular').files;

describe('JHipster server generator', () => {
    describe('generate server', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/server'))
                .withOptions({ skipInstall: true, gatling: true, skipChecks: true })
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    hibernateCache: 'ehcache',
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

        it('creates expected files for default configuration with gatling enabled for server generator', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.gatling);
            assert.noFile(getFilesForOptions(angularfiles, {
                useSass: false,
                enableTranslation: true,
                serviceDiscoveryType: false,
                authenticationType: 'jwt',
                testFrameworks: []
            }));
        });
    });
});

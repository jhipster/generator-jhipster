/* eslint-disable no-unused-expressions, no-console */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expect = require('chai').expect;
const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;
const jhipsterVersion = require('../../package').version;

describe('JHipster application generator with blueprint', () => {
    describe('generate application with a version-compatible blueprint', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: 'generator-jhipster-myblueprint',
                        version: '9.9.9',
                        dependencies: {
                            'generator-jhipster': jhipsterVersion
                        }
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: false,
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
                'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] }
            });
        });
        it('blueprint module and version are in package.json', () => {
            assert.fileContent('package.json', /"generator-jhipster-myblueprint": "9.9.9"/);
        });
    });

    describe('generate application with a conflicting version blueprint', () => {
        it('throws an error', done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: 'generator-jhipster-myblueprint',
                        version: '9.9.9',
                        dependencies: {
                            'generator-jhipster': '1.1.1'
                        }
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: false,
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
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr']
                })
                .on('error', error => {
                    expect(error.message.includes('targets JHipster v1.1.1 and is not compatible with this JHipster version')).to.be.true;
                    done();
                })
                .on('end', () => {
                    expect(true).to.be.false;
                    done();
                });
        });
    });

    describe('generate application with a peer version-compatible blueprint', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: 'generator-jhipster-myblueprint',
                        version: '9.9.9',
                        peerDependencies: {
                            'generator-jhipster': '^6.0.0'
                        }
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: false,
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
                'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-myblueprint', version: '9.9.9' }] }
            });
        });
        it('blueprint module and version are in package.json', () => {
            assert.fileContent('package.json', /"generator-jhipster-myblueprint": "9.9.9"/);
        });
    });

    describe('generate application with a peer conflicting version blueprint', () => {
        it('throws an error', done => {
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const packagejs = {
                        name: 'generator-jhipster-myblueprint',
                        version: '9.9.9',
                        peerDependencies: {
                            'generator-jhipster': '1.1.1'
                        }
                    };
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.writeJsonSync(path.join(fakeBlueprintModuleDir, 'package.json'), packagejs);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    skipChecks: false,
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
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr']
                })
                .on('error', error => {
                    expect(error.message.includes('targets JHipster 1.1.1 and is not compatible with this JHipster version')).to.be.true;
                    done();
                })
                .on('end', () => {
                    expect(true).to.be.false;
                    done();
                });
        });
    });
});

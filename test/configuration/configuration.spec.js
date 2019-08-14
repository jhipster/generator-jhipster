const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const packagejs = require('../../package.json');

describe('JHipster generator', () => {
    context('Default configuration with', () => {
        describe('Old configuration', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true, jhiPrefix: 'test' })
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
                        nativeLanguage: 'fr',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('Compare configuration', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        jhipsterVersion: packagejs.version,
                        jhiPrefix: 'test',
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
                        nativeLanguage: 'fr',
                        languages: ['fr'],
                        buildTool: 'maven',
                        serverSideOptions: []
                    }
                });
                assert.noJsonFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        skipClient: true, // test not positive
                        skipUserManagement: true, // test not positive
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277' // saved only by server
                    }
                });
            });
        });

        describe('New configuration', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        skipChecks: true,
                        jhiPrefix: 'test',
                        'new-configuration': true,
                        'init-configuration': true
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
                        nativeLanguage: 'fr',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('Verify base configurations', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        jhipsterVersion: packagejs.version,
                        jhiPrefix: 'test',
                        baseName: 'jhipster',
                        languages: ['fr']
                    }
                });
                assert.noJsonFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        skipClient: true, // test not positive
                        skipUserManagement: true, // test not positive
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277' // saved only by server
                    }
                });
            });

            it('Compare not implemented configuration', () => {
                assert.noJsonFileContent('.yo-rc.json', {
                    'generator-jhipster': {
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
                        nativeLanguage: 'fr',
                        buildTool: 'maven',
                        serverSideOptions: []
                    }
                });
            });
        });
    });
});

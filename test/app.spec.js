/* global describe, context, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const shouldBeV3DockerfileCompatible = require('./utils/utils').shouldBeV3DockerfileCompatible;
const constants = require('../generators/generator-constants');
const angularJsfiles = require('../generators/client/files-angularjs').files;
const angularfiles = require('../generators/client/files-angular').files;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;

describe('JHipster generator', () => {
    context('Default configuration with', () => {
        describe('AngularJS', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true })
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
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        enableSocialSignIn: false,
                        clientFramework: 'angular1',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtClient);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(getFilesForOptions(angularJsfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
                assert.noFile([
                    `${TEST_DIR}gatling/conf/gatling.conf`,
                    `${TEST_DIR}gatling/conf/logback.xml`
                ]);
            });
            it('contains clientFramework with angular1 value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "angular1"/);
            });
            it('contains clientPackageManager with npm value', () => {
                assert.fileContent('.yo-rc.json', /"clientPackageManager": "yarn"/);
            });
            it('contains install-node-and-yarn in pom.xml', () => {
                assert.fileContent('pom.xml', /install-node-and-yarn/);
            });
            shouldBeV3DockerfileCompatible('mysql');
        });

        describe('AngularX', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files for angularX', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
            it('contains clientFramework with angularX value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
            });
        });

        describe('using npm flag', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true, npm: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
            it('contains clientPackageManager with npm value', () => {
                assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
            });
            it('contains install-node-and-npm in pom.xml', () => {
                assert.fileContent('pom.xml', /install-node-and-npm/);
            });
        });

        describe('Gradle', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'gradle',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files for gradle', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
        });
    });

    context('Application with DB option', () => {
        describe('mariadb configuration', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mariadb',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mariadb);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
            shouldBeV3DockerfileCompatible('mariadb');
        });

        describe('mongodb', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'no',
                        databaseType: 'mongodb',
                        devDatabaseType: 'mongodb',
                        prodDatabaseType: 'mongodb',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with "MongoDB"', () => {
                assert.file(expectedFiles.mongodb);
            });
            shouldBeV3DockerfileCompatible('mongodb');
        });

        describe('mssql', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'no',
                        databaseType: 'sql',
                        devDatabaseType: 'mssql',
                        prodDatabaseType: 'mssql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with "Microsoft SQL Server"', () => {
                assert.file(expectedFiles.mssql);
                assert.fileContent('pom.xml', /mssql-jdbc/);
                assert.fileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`, /identityInsertEnabled/);
            });
            shouldBeV3DockerfileCompatible('mssql');
        });

        describe('cassandra', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'no',
                        databaseType: 'cassandra',
                        devDatabaseType: 'cassandra',
                        prodDatabaseType: 'cassandra',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with "Cassandra"', () => {
                assert.file(expectedFiles.cassandra);
            });
            shouldBeV3DockerfileCompatible('cassandra');
        });

        describe('cassandra no i18n', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'no',
                        databaseType: 'cassandra',
                        devDatabaseType: 'cassandra',
                        prodDatabaseType: 'cassandra',
                        useSass: false,
                        enableTranslation: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with "Cassandra"', () => {
                assert.file(expectedFiles.cassandra);
                assert.noFile(expectedFiles.i18n);
                assert.file([`${SERVER_MAIN_RES_DIR}i18n/messages.properties`]);
            });
        });

        describe('postgresql and elasticsearch', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'no',
                        databaseType: 'sql',
                        devDatabaseType: 'postgresql',
                        prodDatabaseType: 'postgresql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [
                            'searchEngine:elasticsearch'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with "PostgreSQL" and "Elasticsearch"', () => {
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.elasticsearch);
            });
            shouldBeV3DockerfileCompatible('postgresql');
        });
    });

    context('Application with other options', () => {
        describe('oauth2', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with authenticationType "oauth2"', () => {
                assert.file([
                    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/OAuth2ServerConfiguration.java`
                ]);
            });
        });

        describe('hazelcast', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'hazelcast',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });
        });

        describe('Infinispan', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angular1',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'infinispan',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });
            it('creates expected files with "Infinispan"', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.infinispan);
            });
        });

        describe('Infinispan and Eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        clientFramework: 'angular1',
                        authenticationType: 'jwt',
                        hibernateCache: 'infinispan',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });
            it('creates expected files with "Infinispan and Eureka"', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.file(expectedFiles.infinispan);
            });
        });

        describe('Messaging with Kafka configuration', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        clusteredHttpSession: false,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        enableSocialSignIn: false,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        useSass: false,
                        applicationType: 'monolith',
                        testFrameworks: [
                            'gatling'
                        ],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: [
                            'en'
                        ],
                        serverSideOptions: [
                            'messageBroker:kafka'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with Kafka message broker enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.messageBroker);
            });
        });

        describe('API first using swagger-codegen (maven)', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        clusteredHttpSession: false,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        enableSocialSignIn: false,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        useSass: false,
                        applicationType: 'monolith',
                        testFrameworks: [
                            'gatling'
                        ],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: [
                            'en'
                        ],
                        serverSideOptions: [
                            'enableSwaggerCodegen:true'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with Swagger API first enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
            });
        });

        describe('API first using swagger-codegen (gradle)', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        clusteredHttpSession: false,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'gradle',
                        enableSocialSignIn: false,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        useSass: false,
                        applicationType: 'monolith',
                        testFrameworks: [
                            'gatling'
                        ],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: [
                            'en'
                        ],
                        serverSideOptions: [
                            'enableSwaggerCodegen:true'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with Swagger API first enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
                assert.file(expectedFiles.swaggerCodegenGradle);
            });
        });
    });

    context('Application names', () => {
        describe('package names', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with correct package names', () => {
                assert.file([
                    `${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`
                ]);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`, /package com\.otherpackage;/);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`, /public class JhipsterApp/);
            });
        });

        describe('bad application name for java', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: '21Points',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with default application name', () => {
                assert.file([
                    `${SERVER_MAIN_SRC_DIR}com/otherpackage/Application.java`
                ]);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/Application.java`, /public class Application/);
            });
        });

        describe('application names', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'myapplication',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with correct application name', () => {
                assert.file([
                    `${CLIENT_MAIN_SRC_DIR}app/home/home.route.ts`
                ]);
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, /MyapplicationAppModule/);
            });
        });
    });

    context('i18n', () => {
        describe('no i18n', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'hazelcast',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('does not create i18n files if i18n is disabled', () => {
                assert.noFile(expectedFiles.i18n);
                assert.file([`${SERVER_MAIN_RES_DIR}i18n/messages.properties`]);
            });
        });

        describe('with RTL support', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['ar-ly'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files for i18n with RTL support', () => {
                assert.file(expectedFiles.i18nRtl);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
            it('contains updatePageDirection in language helper', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/shared/language/language.helper.ts`, /private updatePageDirection/);
            });
        });
    });

    context('social login', () => {
        describe('social login for HTTP session', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'session',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [
                            'enableSocialSignIn:true'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with social login for HTTP session enabled', () => {
                assert.file(expectedFiles.session);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'session',
                    testFrameworks: [],
                    enableSocialSignIn: true
                }));
            });
        });

        describe('social login for JWT authentication', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [
                            'enableSocialSignIn:true'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with social login for JWT authentication enabled', () => {
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                    enableSocialSignIn: true
                }));
            });
        });
    });

    context('Auth options', () => {
        describe('JWT authentication', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with JWT authentication', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }));
            });
        });

        describe('HTTP session authentication', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'session',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with HTTP session authentication', () => {
                assert.file(expectedFiles.session);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'session',
                    testFrameworks: []
                }));
            });
        });
    });

    context('Testing options', () => {
        describe('Protractor tests', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        authenticationType: 'jwt',
                        serviceDiscoveryType: false,
                        hibernateCache: 'ehcache',
                        clusteredHttpSession: false,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        enableSocialSignIn: false,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        useSass: false,
                        applicationType: 'monolith',
                        testFrameworks: [
                            'protractor'
                        ],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: [
                            'en'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with Protractor enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [
                        'protractor'
                    ]
                }));
                assert.noFile([
                    `${TEST_DIR}gatling/conf/gatling.conf`,
                    `${TEST_DIR}gatling/conf/logback.xml`
                ]);
            });
        });

        describe('Cucumber tests', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        clusteredHttpSession: false,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        enableSocialSignIn: false,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        useSass: false,
                        applicationType: 'monolith',
                        testFrameworks: [
                            'cucumber'
                        ],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: [
                            'en'
                        ]
                    })
                    .on('end', done);
            });

            it('creates expected files with Cucumber enabled', () => {
                assert.file(expectedFiles.server);
                assert.file([
                    `${TEST_DIR}features/user/user.feature`
                ]);
                assert.noFile([
                    `${TEST_DIR}gatling/conf/gatling.conf`,
                    `${TEST_DIR}gatling/conf/logback.xml`
                ]);
            });
        });
    });

    context('App with skip client', () => {
        describe('Maven', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipClient: true, skipChecks: true })
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
                        buildTool: 'maven',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.maven);
                assert.noFile(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'session',
                    testFrameworks: []
                }, '', ['package.json']));
            });
        });

        describe('Gradle', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipClient: true, skipChecks: true })
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
                        buildTool: 'gradle',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.gradle);
                assert.noFile(getFilesForOptions(angularfiles, {
                    useSass: false,
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                }, '', ['package.json']));
                assert.noFile(['gradle/yeoman.gradle']);
            });
        });
    });

    context('Eureka', () => {
        describe('gateway with eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('monolith with eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'monolith',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angular1',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: ['serviceDiscoveryType:eureka']
                    })
                    .on('end', done);
            });

            it('creates expected files with the monolith application type', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with gradle and eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'gradle',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                        skipClient: true,
                        skipUserManagement: true
                    })
                    .on('end', done);
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.microserviceGradle);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('UAA server with Eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'uaa',
                        baseName: 'jhipster-uaa',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serverPort: '9999',
                        authenticationType: 'uaa',
                        hibernateCache: 'no',
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                        serviceDiscoveryType: 'eureka'
                    })
                    .on('end', done);
            });

            it('creates expected files with the UAA application type', () => {
                assert.file(expectedFiles.uaa);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
            });
        });

        describe('UAA gateway with eureka', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .inTmpDir((dir) => {
                        fse.copySync(path.join(__dirname, './templates/uaaserver/'), dir);
                    })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serverPort: '8080',
                        authenticationType: 'uaa',
                        uaaBaseName: './uaa/',
                        hibernateCache: 'hazelcast',
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                        serviceDiscoveryType: 'eureka'
                    })
                    .on('end', done);
            });

            it('creates expected files for UAA auth with the Gateway application type', () => {
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
            });
        });
    });

    context('Consul', () => {
        describe('gateway with consul', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'consul',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });

        describe('microservice with consul', () => {
            beforeEach((done) => {
                helpers.run(path.join(__dirname, '../generators/app'))
                    .withOptions({ skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'consul',
                        authenticationType: 'jwt',
                        hibernateCache: 'ehcache',
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });
    });
});

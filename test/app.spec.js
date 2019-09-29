const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const shouldBeV3DockerfileCompatible = require('./utils/utils').shouldBeV3DockerfileCompatible;
const constants = require('../generators/generator-constants');
const angularFiles = require('../generators/client/files-angular').files;
const reactFiles = require('../generators/client/files-react').files;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const TEST_DIR = constants.TEST_DIR;

describe('JHipster generator', () => {
    context('Default configuration with', () => {
        describe('AngularX', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
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
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
            it('contains clientFramework with angularX value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
            });
            it('contains correct custom prefix when specified', () => {
                assert.fileContent('angular.json', /"prefix": "test"/);
            });
            it('generates a README with no undefined value', () => {
                assert.noFileContent('README.md', /undefined/);
            });
            it('uses correct prettier formatting', () => {
                // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
                assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
                assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
            });
        });

        describe('React', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        skipChecks: true,
                        jhiPrefix: 'test',
                        experimental: true
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'react',
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
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files for react', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(reactFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
            it('contains clientFramework with react value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
            });
            it('uses correct prettier formatting', () => {
                // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
                assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
                assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
            });
        });

        describe('using npm flag', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true, npm: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
            it('contains clientPackageManager with npm value', () => {
                assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
            });
            it('contains install-node-and-npm in pom.xml', () => {
                assert.fileContent('pom.xml', /install-node-and-npm/);
            });
        });

        describe('Gradle', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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
                        buildTool: 'gradle',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected default files for gradle', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
        });
    });

    context('Application with DB option', () => {
        describe('mariadb', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mariadb',
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
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.mariadb);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
            shouldBeV3DockerfileCompatible('mariadb');
        });

        describe('mongodb', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'mongodb',
                        devDatabaseType: 'mongodb',
                        prodDatabaseType: 'mongodb',
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
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible('mongodb');
        });

        describe('couchbase', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'couchbase',
                        devDatabaseType: 'couchbase',
                        prodDatabaseType: 'couchbase',
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

            it('creates expected files with "Couchbase"', () => {
                assert.file(expectedFiles.couchbase);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible('couchbase');
        });

        describe('mssql', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'sql',
                        devDatabaseType: 'mssql',
                        prodDatabaseType: 'mssql',
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
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.fileContent('pom.xml', /mssql-jdbc/);
                assert.fileContent(
                    `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
                    /identityInsertEnabled/
                );
            });
            shouldBeV3DockerfileCompatible('mssql');
        });

        describe('cassandra', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'cassandra',
                        devDatabaseType: 'cassandra',
                        prodDatabaseType: 'cassandra',
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
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible('cassandra');
        });

        describe('cassandra no i18n', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'cassandra',
                        devDatabaseType: 'cassandra',
                        prodDatabaseType: 'cassandra',
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
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'sql',
                        devDatabaseType: 'postgresql',
                        prodDatabaseType: 'postgresql',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: ['searchEngine:elasticsearch']
                    })
                    .on('end', done);
            });

            it('creates expected files with "PostgreSQL" and "Elasticsearch"', () => {
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.elasticsearch);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
            shouldBeV3DockerfileCompatible('postgresql');
        });

        describe('no database', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'hazelcast',
                        enableHibernateCache: true,
                        databaseType: 'no',
                        devDatabaseType: 'no',
                        prodDatabaseType: 'no',
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
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.userManagementServer);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
        });
    });

    context('Application with other options', () => {
        describe('oauth2', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
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

            it('creates expected files with authenticationType "oauth2"', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
            it('generates README with instructions for OAuth', () => {
                assert.fileContent('README.md', 'OAuth 2.0');
            });
        });

        describe('oauth2 + elasticsearch', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
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
                        serverSideOptions: ['searchEngine:elasticsearch']
                    })
                    .on('end', done);
            });

            it('creates expected files with authenticationType "oauth2" and elasticsearch', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.elasticsearch);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.mysql);
            });
        });

        describe('oauth2 + mongodb', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'mongodb',
                        devDatabaseType: 'mongodb',
                        prodDatabaseType: 'mongodb',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: []
                    })
                    .on('end', done);
            });

            it('creates expected files with authenticationType "oauth2" and mongodb', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.mongodb);
            });
        });

        describe('hazelcast', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'hazelcast',
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
            it('creates expected files with "Hazelcast"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.hazelcast);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angular1',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'infinispan',
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
            it('creates expected files with "Infinispan"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.infinispan);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan and Eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        clientFramework: 'angular1',
                        authenticationType: 'jwt',
                        cacheProvider: 'infinispan',
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
            it('creates expected files with "Infinispan and Eureka"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.file(expectedFiles.infinispan);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Memcached', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'memcached',
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
            it('creates expected files with "Memcached"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.memcached);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Redis', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'redis',
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
            it('creates expected files with "Redis"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.redis);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Messaging with Kafka configuration', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: 'monolith',
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        serverSideOptions: ['messageBroker:kafka']
                    })
                    .on('end', done);
            });

            it('creates expected files with Kafka message broker enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.messageBroker);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('API first using OpenAPI-generator (maven)', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: 'monolith',
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        serverSideOptions: ['enableSwaggerCodegen:true']
                    })
                    .on('end', done);
            });

            it('creates expected files with Swagger API first enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
            });
            it('generates README with instructions for OpenAPI generator', () => {
                assert.fileContent('README.md', 'OpenAPI-Generator');
            });
        });

        describe('API first using OpenAPI-generator (gradle)', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'gradle',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: 'monolith',
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        serverSideOptions: ['enableSwaggerCodegen:true']
                    })
                    .on('end', done);
            });

            it('creates expected files with Swagger API first enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
                assert.file(expectedFiles.swaggerCodegenGradle);
            });
        });
    });

    context('Application names', () => {
        describe('package names', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: 'angularX',
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

            it('creates expected files with correct package names', () => {
                assert.file([`${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`]);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`, /package com\.otherpackage;/);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/JhipsterApp.java`, /public class JhipsterApp/);
            });
        });

        describe('bad application name for java', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: '21Points',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: 'angularX',
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

            it('creates expected files with default application name', () => {
                assert.file([
                    `${SERVER_MAIN_SRC_DIR}com/otherpackage/Application.java`,
                    `${SERVER_MAIN_SRC_DIR}com/otherpackage/ApplicationWebXml.java`
                ]);
                assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/otherpackage/Application.java`, /public class Application/);
            });
        });

        describe('application names', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'myapplication',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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

            it('creates expected files with correct application name', () => {
                assert.file([`${CLIENT_MAIN_SRC_DIR}app/home/home.route.ts`]);
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, /MyapplicationAppModule/);
            });
        });
    });

    context('i18n', () => {
        describe('no i18n', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'hazelcast',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
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
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
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
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
            it('contains updatePageDirection in language helper', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/core/language/language.helper.ts`, /private updatePageDirection/);
            });
        });
    });

    context('Auth options', () => {
        describe('JWT authentication', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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

            it('creates expected files with JWT authentication', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: []
                    })
                );
            });
        });

        describe('HTTP session authentication', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'session',
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

            it('creates expected files with HTTP session authentication', () => {
                assert.file(expectedFiles.session);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'session',
                        testFrameworks: []
                    })
                );
            });
        });
    });

    context('Testing options', () => {
        describe('Protractor tests', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        authenticationType: 'jwt',
                        serviceDiscoveryType: false,
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: 'monolith',
                        testFrameworks: ['protractor'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en']
                    })
                    .on('end', done);
            });

            it('creates expected files with Protractor enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(
                    getFilesForOptions(angularFiles, {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: ['protractor']
                    })
                );
                assert.noFile([`${TEST_DIR}gatling/conf/gatling.conf`, `${TEST_DIR}gatling/conf/logback.xml`]);
            });
        });

        describe('Cucumber tests', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Disk',
                        prodDatabaseType: 'mysql',
                        searchEngine: false,
                        buildTool: 'maven',
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: 'monolith',
                        testFrameworks: ['cucumber'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en']
                    })
                    .on('end', done);
            });

            it('creates expected files with Cucumber enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.cucumber);
                assert.noFile([`${TEST_DIR}gatling/conf/gatling.conf`, `${TEST_DIR}gatling/conf/logback.xml`]);
            });
        });
    });

    context('App with skip server', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({ 'from-cli': true, skipInstall: true, skipServer: true, db: 'mysql', auth: 'jwt', skipChecks: true })
                .withPrompts({
                    baseName: 'jhipster',
                    clientFramework: 'angularX',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277'
                })
                .on('end', done);
        });

        it('creates expected files for default configuration with skip server option enabled', () => {
            assert.file(expectedFiles.common);
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.userManagementServer);
            assert.noFile(expectedFiles.maven);
            assert.noFile(expectedFiles.mysql);
            assert.noFile(expectedFiles.hibernateTimeZoneConfig);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: []
                })
            );
        });
        it('generates a README with no undefined value', () => {
            assert.noFileContent('README.md', /undefined/);
        });
    });

    context('App with skip client', () => {
        describe('Maven', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipClient: true, skipChecks: true })
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
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.noFile(
                    getFilesForOptions(
                        angularFiles,
                        {
                            enableTranslation: true,
                            serviceDiscoveryType: false,
                            authenticationType: 'session',
                            testFrameworks: []
                        },
                        '',
                        ['package.json']
                    )
                );
            });
            it('generates a README with no undefined value', () => {
                assert.noFileContent('README.md', /undefined/);
            });
            it('generates a pom.xml with no reference to client', () => {
                assert.noFileContent('pom.xml', 'node.version');
                assert.noFileContent('pom.xml', 'npm.version');
                assert.noFileContent('pom.xml', 'frontend-maven-plugin');
            });
        });

        describe('Gradle', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipClient: true, skipChecks: true })
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
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.noFile(
                    getFilesForOptions(
                        angularFiles,
                        {
                            enableTranslation: true,
                            serviceDiscoveryType: false,
                            authenticationType: 'jwt',
                            testFrameworks: []
                        },
                        '',
                        ['package.json']
                    )
                );
            });
            it('generates README with instructions for Gradle', () => {
                assert.fileContent('README.md', './gradlew');
            });
        });
    });

    context('App with skip client and skip user management', () => {
        describe('Maven', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        skipClient: true,
                        skipUserManagement: true,
                        skipChecks: true
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        applicationType: 'monolith',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
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

            it('creates expected server files', () => {
                assert.file(expectedFiles.server);
                assert.noFile(expectedFiles.userManagementServer);
            });
            it('creates SecurityConfiguration for default configuration with skip client and skip user management option enabled', () => {
                assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.java`);
            });
        });
    });

    context('Eureka', () => {
        describe('gateway with eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'eureka',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.noFile(expectedFiles.rateLimitingFilesForGateways);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('gateway with eureka and rate limiting', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        cacheProvider: 'hazelcast',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.rateLimitingFilesForGateways);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
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

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('monolith with eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'monolith',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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
                        serverSideOptions: ['serviceDiscoveryType:eureka']
                    })
                    .on('end', done);
            });

            it('creates expected files with the monolith application type', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with gradle and eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'eureka',
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
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
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.microserviceGradle);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
                assert.noFile(expectedFiles.userManagementServer);
            });
        });

        describe('UAA server with Eureka', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'uaa',
                        baseName: 'jhipster-uaa',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serverPort: '9999',
                        authenticationType: 'uaa',
                        cacheProvider: 'no',
                        enableHibernateCache: false,
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
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
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .inTmpDir(dir => {
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
                        cacheProvider: 'hazelcast',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
                        prodDatabaseType: 'mysql',
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
                assert.file(expectedFiles.rateLimitingFilesForGateways);
                assert.file(expectedFiles.gatewayWithUaa);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
                assert.file(expectedFiles.hazelcast);
            });
        });
    });

    context('Consul', () => {
        describe('gateway with consul', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'consul',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.noFile(expectedFiles.rateLimitingFilesForGateways);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });

        describe('gateway with consul and rate limiting', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: 'consul',
                        authenticationType: 'jwt',
                        cacheProvider: 'hazelcast',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.rateLimitingFilesForGateways);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });

        describe('microservice with consul', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: 'consul',
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
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

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });
    });

    context('No Service Discovery', () => {
        describe('gateway with no service discovery', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.noFile(expectedFiles.gateway);
                assert.noFile(expectedFiles.rateLimitingFilesForGateways);
                assert.noFile(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('UAA gateway with no service discovery', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true, 'uaa-base-name': 'jhipsterApp' })
                    .withPrompts({
                        applicationType: 'gateway',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: 'uaa',
                        uaaBaseName: 'jhipsterApp',
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

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.gatewayWithUaa);
                assert.noFile(expectedFiles.gateway);
                assert.noFile(expectedFiles.rateLimitingFilesForGateways);
                assert.noFile(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with no service discovery', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .withPrompts({
                        applicationType: 'microservice',
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'mysql',
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

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });
    });
});

'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    prompts = require('./prompts'),
    scriptBase = require('../generator-base'),
    cleanup = require('../cleanup'),
    packagejs = require('../../package.json'),
    crypto = require('crypto'),
    mkdirp = require('mkdirp');

var JhipsterServerGenerator = generators.Base.extend({});

util.inherits(JhipsterServerGenerator, scriptBase);

/* Constants used throughout */
const constants = require('../generator-constants'),
    QUESTIONS = constants.SERVER_QUESTIONS,
    INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX,
    DOCKER_DIR = constants.DOCKER_DIR,
    MAIN_DIR = constants.MAIN_DIR,
    TEST_DIR = constants.TEST_DIR,
    CLIENT_DIST_DIR = constants.CLIENT_DIST_DIR,
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR,
    SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR,

    DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY,
    DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE,
    DOCKER_MYSQL = constants.DOCKER_MYSQL,
    DOCKER_MARIADB = constants.DOCKER_MARIADB,
    DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL,
    DOCKER_MONGODB = constants.DOCKER_MONGODB,
    DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA,
    DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH,
    DOCKER_KAFKA = constants.DOCKER_KAFKA,
    DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER,
    DOCKER_SONAR = constants.DOCKER_SONAR,
    DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE,
    DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH,
    DOCKER_CONSUL = constants.DOCKER_CONSUL,

    JHIPSTER_DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL,
    JHIPSTER_DOCUMENTATION_ARCHIVE_PATH = constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;

var javaDir;

module.exports = JhipsterServerGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.configOptions = this.options.configOptions || {};

        // This adds support for a `--[no-]client-hook` flag
        this.option('client-hook', {
            desc: 'Enable gulp and bower hook from maven/gradle build',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--[no-]i18n` flag
        this.option('i18n', {
            desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
            type: Boolean,
            defaults: true
        });

        // This adds support for a `--protractor` flag
        this.option('protractor', {
            desc: 'Enable protractor tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--cucumber` flag
        this.option('cucumber', {
            desc: 'Enable cucumber tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
            type: Boolean,
            defaults: false
        });

        this.skipClient = !this.options['client-hook'] || this.configOptions.skipClient || this.config.get('skipClient');
        this.skipUserManagement = this.configOptions.skipUserManagement || this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.enableTranslation = this.options['i18n'];
        this.testFrameworks = [];
        this.options['gatling'] && this.testFrameworks.push('gatling');
        this.options['cucumber'] && this.testFrameworks.push('cucumber');
        this.currentQuestion = this.configOptions.lastQuestion ? this.configOptions.lastQuestion : 0;
        this.totalQuestions = this.configOptions.totalQuestions ? this.configOptions.totalQuestions : QUESTIONS;
        this.logo = this.configOptions.logo;
        this.baseName = this.configOptions.baseName;
    },
    initializing: {
        displayLogo: function () {
            if (this.logo) {
                this.printJHipsterLogo();
            }
        },

        setupServerVars: function () {
            // Make constants available in templates
            this.MAIN_DIR = MAIN_DIR;
            this.TEST_DIR = TEST_DIR;
            this.CLIENT_MAIN_SRC_DIR = CLIENT_MAIN_SRC_DIR;
            this.CLIENT_TEST_SRC_DIR = CLIENT_TEST_SRC_DIR;
            this.SERVER_MAIN_SRC_DIR = SERVER_MAIN_SRC_DIR;
            this.SERVER_MAIN_RES_DIR = SERVER_MAIN_RES_DIR;
            this.SERVER_TEST_SRC_DIR = SERVER_TEST_SRC_DIR;
            this.SERVER_TEST_RES_DIR = SERVER_TEST_RES_DIR;

            this.DOCKER_JHIPSTER_REGISTRY = DOCKER_JHIPSTER_REGISTRY;
            this.DOCKER_JAVA_JRE = DOCKER_JAVA_JRE,
            this.DOCKER_MYSQL = DOCKER_MYSQL;
            this.DOCKER_MARIADB = DOCKER_MARIADB;
            this.DOCKER_POSTGRESQL = DOCKER_POSTGRESQL;
            this.DOCKER_MONGODB = DOCKER_MONGODB;
            this.DOCKER_CASSANDRA = DOCKER_CASSANDRA;
            this.DOCKER_ELASTICSEARCH = DOCKER_ELASTICSEARCH;
            this.DOCKER_KAFKA = DOCKER_KAFKA;
            this.DOCKER_ZOOKEEPER = DOCKER_ZOOKEEPER;
            this.DOCKER_SONAR = DOCKER_SONAR;
            this.DOCKER_JHIPSTER_CONSOLE = DOCKER_JHIPSTER_CONSOLE;
            this.DOCKER_JHIPSTER_ELASTICSEARCH = DOCKER_JHIPSTER_ELASTICSEARCH;
            this.DOCKER_JHIPSTER_LOGSTASH = DOCKER_JHIPSTER_LOGSTASH;
            this.DOCKER_CONSUL = DOCKER_CONSUL;

            this.javaVersion = '8'; // Java version is forced to be 1.8. We keep the variable as it might be useful in the future.
            this.packagejs = packagejs;
            this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }

            this.packageName = this.config.get('packageName');
            this.serverPort = this.config.get('serverPort');
            if (this.serverPort === undefined) {
                this.serverPort = '8080';
            }
            this.websocket = this.config.get('websocket') === 'no' ? false : this.config.get('websocket');
            this.clusteredHttpSession = this.config.get('clusteredHttpSession') === 'no' ? false : this.config.get('clusteredHttpSession');
            this.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
            if (this.searchEngine === undefined) {
                this.searchEngine = false;
            }
            this.messageBroker = this.config.get('messageBroker');
            if (this.messageBroker === undefined) {
                this.messageBroker = false;
            }

            this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
            if (this.serviceDiscoveryType === undefined) {
                this.serviceDiscoveryType = this.applicationType !== 'monolith' ? 'eureka' : false;
            }
            this.databaseType = this.config.get('databaseType');
            if (this.databaseType === 'mongodb') {
                this.devDatabaseType = 'mongodb';
                this.prodDatabaseType = 'mongodb';
                this.hibernateCache = 'no';
            } else if (this.databaseType === 'cassandra') {
                this.devDatabaseType = 'cassandra';
                this.prodDatabaseType = 'cassandra';
                this.hibernateCache = 'no';
            } else if (this.databaseType === 'no') {
                // no database, only available for microservice applications
                this.devDatabaseType = 'no';
                this.prodDatabaseType = 'no';
                this.hibernateCache = 'no';
            } else {
                // sql
                this.devDatabaseType = this.config.get('devDatabaseType');
                this.prodDatabaseType = this.config.get('prodDatabaseType');
                this.hibernateCache = this.config.get('hibernateCache');
            }
            this.buildTool = this.config.get('buildTool');
            this.enableSocialSignIn = this.config.get('enableSocialSignIn');
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            if (this.jhipsterVersion === undefined) {
                this.jhipsterVersion = packagejs.version;
            }
            this.authenticationType = this.config.get('authenticationType');
            if (this.authenticationType === 'session') {
                this.rememberMeKey = this.config.get('rememberMeKey');
            }
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            this.uaaBaseName = this.config.get('uaaBaseName');
            var testFrameworks = this.config.get('testFrameworks');
            if (testFrameworks) {
                this.testFrameworks = testFrameworks;
            }
            var baseName = this.config.get('baseName');
            if (baseName) {
                // to avoid overriding name from configOptions
                this.baseName = baseName;
            }

            // force variables unused by microservice applications
            if (this.applicationType === 'microservice' || this.applicationType === 'uaa') {
                this.clusteredHttpSession = false;
                this.websocket = false;
            }

            var serverConfigFound = this.packageName !== undefined &&
                this.authenticationType !== undefined &&
                this.hibernateCache !== undefined &&
                this.clusteredHttpSession !== undefined &&
                this.websocket !== undefined &&
                this.databaseType !== undefined &&
                this.devDatabaseType !== undefined &&
                this.prodDatabaseType !== undefined &&
                this.searchEngine !== undefined &&
                this.buildTool !== undefined;

            if (this.baseName !== undefined && serverConfigFound) {

                // Generate remember me key if key does not already exist in config
                if (this.authenticationType === 'session' && this.rememberMeKey === undefined) {
                    this.rememberMeKey = crypto.randomBytes(20).toString('hex');
                }

                // Generate JWT secert key if key does not already exist in config
                if (this.authenticationType === 'jwt' && this.jwtSecretKey === undefined) {
                    this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
                }

                // If social sign in is not defined, it is disabled by default
                if (this.enableSocialSignIn === undefined) {
                    this.enableSocialSignIn = false;
                }

                // If translation is not defined, it is enabled by default
                if (this.enableTranslation === undefined) {
                    this.enableTranslation = true;
                }
                if (this.nativeLanguage === undefined) {
                    this.nativeLanguage = 'en';
                }
                if (this.languages === undefined) {
                    this.languages = ['en', 'fr'];
                }
                // user-management will be handled by UAA app
                if(this.applicationType === 'gateway' && this.authenticationType === 'uaa') {
                    this.skipUserManagement = true;
                }

                this.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
                    'to re-generate the project...\n'));

                this.existingProject = true;
            }
        }
    },

    prompting: {

        askForModuleName: prompts.askForModuleName,
        askForServerSideOpts: prompts.askForServerSideOpts,
        askForOptionalItems: prompts.askForOptionalItems,
        askFori18n: prompts.askFori18n,

        setSharedConfigOptions: function () {
            this.configOptions.lastQuestion = this.currentQuestion;
            this.configOptions.totalQuestions = this.totalQuestions;
            this.configOptions.packageName = this.packageName;
            this.configOptions.hibernateCache = this.hibernateCache;
            this.configOptions.clusteredHttpSession = this.clusteredHttpSession;
            this.configOptions.websocket = this.websocket;
            this.configOptions.databaseType = this.databaseType;
            this.configOptions.devDatabaseType = this.devDatabaseType;
            this.configOptions.prodDatabaseType = this.prodDatabaseType;
            this.configOptions.searchEngine = this.searchEngine;
            this.configOptions.messageBroker = this.messageBroker;
            this.configOptions.serviceDiscoveryType = this.serviceDiscoveryType;
            this.configOptions.buildTool = this.buildTool;
            this.configOptions.enableSocialSignIn = this.enableSocialSignIn;
            this.configOptions.authenticationType = this.authenticationType;
            this.configOptions.uaaBaseName = this.uaaBaseName;
            this.configOptions.serverPort = this.serverPort;

            // Make dist dir available in templates
            if (this.buildTool === 'maven') {
                this.CLIENT_DIST_DIR = 'target/' + CLIENT_DIST_DIR;
            } else {
                this.CLIENT_DIST_DIR = 'build/' + CLIENT_DIST_DIR;
            }
            // Make documentation URL available in templates
            this.DOCUMENTATION_URL = JHIPSTER_DOCUMENTATION_URL;
            this.DOCUMENTATION_ARCHIVE_URL = JHIPSTER_DOCUMENTATION_URL + JHIPSTER_DOCUMENTATION_ARCHIVE_PATH + 'v' + this.jhipsterVersion;
        }
    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'server');
            insight.track('app/authenticationType', this.authenticationType);
            insight.track('app/hibernateCache', this.hibernateCache);
            insight.track('app/clusteredHttpSession', this.clusteredHttpSession);
            insight.track('app/websocket', this.websocket);
            insight.track('app/databaseType', this.databaseType);
            insight.track('app/devDatabaseType', this.devDatabaseType);
            insight.track('app/prodDatabaseType', this.prodDatabaseType);
            insight.track('app/searchEngine', this.searchEngine);
            insight.track('app/messageBroker', this.messageBroker);
            insight.track('app/serviceDiscoveryType', this.serviceDiscoveryType);
            insight.track('app/buildTool', this.buildTool);
            insight.track('app/enableSocialSignIn', this.enableSocialSignIn);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.angularAppName = this.getAngularAppName();
            this.camelizedBaseName = _.camelCase(this.baseName);
            this.dasherizedBaseName = _.kebabCase(this.baseName);
            this.lowercaseBaseName = this.baseName.toLowerCase();
            this.humanizedBaseName = _.startCase(this.baseName);
            this.mainClass = this.getMainClassName();

            if (this.prodDatabaseType === 'oracle') {
                // create a folder for users to place ojdbc jar
                this.ojdbcVersion = '7';
                this.libFolder = 'lib/oracle/ojdbc/' + this.ojdbcVersion + '/';
                mkdirp(this.libFolder);
            }

            if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
                this.pkType = 'String';
            } else {
                this.pkType = 'Long';
            }

            this.packageFolder = this.packageName.replace(/\./g, '/');
            javaDir = this.javaDir = SERVER_MAIN_SRC_DIR + this.packageFolder + '/';
            this.testDir = SERVER_TEST_SRC_DIR + this.packageFolder + '/';
            if (!this.nativeLanguage) {
                // set to english when translation is set to false
                this.nativeLanguage = 'en';
            }
        },

        saveConfig: function () {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('baseName', this.baseName);
            this.config.set('packageName', this.packageName);
            this.config.set('packageFolder', this.packageFolder);
            this.config.set('serverPort', this.serverPort);
            this.config.set('authenticationType', this.authenticationType);
            this.config.set('uaaBaseName', this.uaaBaseName);
            this.config.set('hibernateCache', this.hibernateCache);
            this.config.set('clusteredHttpSession', this.clusteredHttpSession);
            this.config.set('websocket', this.websocket);
            this.config.set('databaseType', this.databaseType);
            this.config.set('devDatabaseType', this.devDatabaseType);
            this.config.set('prodDatabaseType', this.prodDatabaseType);
            this.config.set('searchEngine', this.searchEngine);
            this.config.set('messageBroker', this.messageBroker);
            this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
            this.config.set('buildTool', this.buildTool);
            this.config.set('enableSocialSignIn', this.enableSocialSignIn);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('rememberMeKey', this.rememberMeKey);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
        }
    },

    default: {
        getSharedConfigOptions: function () {
            this.useSass = this.configOptions.useSass ? this.configOptions.useSass : false;
            if (this.configOptions.enableTranslation !== undefined) {
                this.enableTranslation = this.configOptions.enableTranslation;
            }
            if (this.configOptions.nativeLanguage !== undefined) {
                this.nativeLanguage = this.configOptions.nativeLanguage;
            }
            if (this.configOptions.languages !== undefined) {
                this.languages = this.configOptions.languages;
            }
            if (this.configOptions.testFrameworks) {
                this.testFrameworks = this.configOptions.testFrameworks;
            }
        },

        composeLanguages: function () {
            if (this.configOptions.skipI18nQuestion) return;

            this.composeLanguagesSub(this, this.configOptions, 'server');
        }
    },

    writing: {

        cleanupOldServerFiles: function() {
            cleanup.cleanupOldServerFiles(this, this.javaDir, this.testDir);
        },

        writeGlobalFiles: function () {
            this.template('_README.md', 'README.md', this, {});
            this.copy('gitignore', '.gitignore');
            this.copy('gitattributes', '.gitattributes');
            this.copy('editorconfig', '.editorconfig');
            this.template('_travis.yml', '.travis.yml', this, {});
            this.template('_Jenkinsfile', 'Jenkinsfile', this, {});
        },

        writeDockerFiles: function () {
            // Create Docker and Docker Compose files
            this.template(DOCKER_DIR + '_Dockerfile', DOCKER_DIR + 'Dockerfile', this, {});
            this.template(DOCKER_DIR + '_app.yml', DOCKER_DIR + 'app.yml', this, {});
            if (this.prodDatabaseType === 'mysql') {
                this.template(DOCKER_DIR + '_mysql.yml', DOCKER_DIR + 'mysql.yml', this, {});
            }
            if (this.prodDatabaseType === 'mariadb') {
                this.template(DOCKER_DIR + '_mariadb.yml', DOCKER_DIR + 'mariadb.yml', this, {});
            }
            if (this.prodDatabaseType === 'postgresql') {
                this.template(DOCKER_DIR + '_postgresql.yml', DOCKER_DIR + 'postgresql.yml', this, {});
            }
            if (this.prodDatabaseType === 'mongodb') {
                this.template(DOCKER_DIR + '_mongodb.yml', DOCKER_DIR + 'mongodb.yml', this, {});
                this.template(DOCKER_DIR + '_mongodb-cluster.yml', DOCKER_DIR + 'mongodb-cluster.yml', this, {});
                this.copy(DOCKER_DIR + 'mongodb/MongoDB.Dockerfile', DOCKER_DIR + 'mongodb/MongoDB.Dockerfile', this, {});
                this.template(DOCKER_DIR + 'mongodb/scripts/init_replicaset.js', DOCKER_DIR + 'mongodb/scripts/init_replicaset.js', this, {});
            }
            if (this.applicationType === 'gateway' || this.prodDatabaseType === 'cassandra') {
                // docker-compose files
                this.template(DOCKER_DIR + '_cassandra.yml', DOCKER_DIR + 'cassandra.yml', this, {});
                this.template(DOCKER_DIR + '_cassandra-cluster.yml', DOCKER_DIR + 'cassandra-cluster.yml', this, {});
                this.template(DOCKER_DIR + '_cassandra-migration.yml', DOCKER_DIR + 'cassandra-migration.yml', this, {});
                // dockerfiles
                this.template(DOCKER_DIR + 'cassandra/_Cassandra-Migration.Dockerfile', DOCKER_DIR + 'cassandra/Cassandra-Migration.Dockerfile', this, {});
                // scripts
                this.template(DOCKER_DIR + 'cassandra/scripts/_autoMigrate.sh', DOCKER_DIR + 'cassandra/scripts/autoMigrate.sh', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_execute-cql.sh', DOCKER_DIR + 'cassandra/scripts/execute-cql.sh', this, {});
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(DOCKER_DIR + '_elasticsearch.yml', DOCKER_DIR + 'elasticsearch.yml', this, {});
            }
            if (this.messageBroker === 'kafka') {
                this.template(DOCKER_DIR + '_kafka.yml', DOCKER_DIR + 'kafka.yml', this, {});
            }

            if (this.applicationType === 'microservice' || this.applicationType === 'gateway' || this.applicationType === 'uaa') {
                this.template(DOCKER_DIR + 'config/_README.md', DOCKER_DIR + 'central-server-config/README.md',this, {});

                if (this.serviceDiscoveryType === 'consul') {
                    this.template(DOCKER_DIR + '_consul.yml', DOCKER_DIR + 'consul.yml', this, {});
                    this.copy(DOCKER_DIR + 'config/git2consul.json', DOCKER_DIR + 'config/git2consul.json');
                    this.copy(DOCKER_DIR + 'config/consul-config/application.yml', DOCKER_DIR + 'central-server-config/application.yml');
                }

                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(DOCKER_DIR + '_jhipster-registry.yml', DOCKER_DIR + 'jhipster-registry.yml', this, {});
                    this.copy(DOCKER_DIR + 'config/docker-config/application.yml', DOCKER_DIR + 'central-server-config/docker-config/application.yml');
                    this.copy(DOCKER_DIR + 'config/localhost-config/application.yml', DOCKER_DIR + 'central-server-config/localhost-config/application.yml');
                }
            }


            this.template(DOCKER_DIR + '_sonar.yml', DOCKER_DIR + 'sonar.yml', this, {});
        },

        writeServerBuildFiles: function () {

            switch (this.buildTool) {
            case 'gradle':
                this.template('_build.gradle', 'build.gradle', this, {});
                this.template('_settings.gradle', 'settings.gradle', this, {});
                this.template('_gradle.properties', 'gradle.properties', this, {});
                if (!this.skipClient) {
                    this.template('gradle/_yeoman.gradle', 'gradle/yeoman.gradle', this, {});
                }
                this.template('gradle/_sonar.gradle', 'gradle/sonar.gradle', this, {});
                this.template('gradle/_docker.gradle', 'gradle/docker.gradle', this, {});
                this.template('gradle/_profile_dev.gradle', 'gradle/profile_dev.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                this.template('gradle/_profile_prod.gradle', 'gradle/profile_prod.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                this.template('gradle/_mapstruct.gradle', 'gradle/mapstruct.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                if (this.testFrameworks.indexOf('gatling') !== -1) {
                    this.template('gradle/_gatling.gradle', 'gradle/gatling.gradle', this, {});
                }
                if (this.databaseType === 'sql') {
                    this.template('gradle/_liquibase.gradle', 'gradle/liquibase.gradle', this, {});
                }
                this.copy('gradlew', 'gradlew');
                this.copy('gradlew.bat', 'gradlew.bat');
                this.copy('gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.jar');
                this.copy('gradle/wrapper/gradle-wrapper.properties', 'gradle/wrapper/gradle-wrapper.properties');
                break;
            case 'maven':
            default :
                this.copy('mvnw', 'mvnw');
                this.copy('mvnw.cmd', 'mvnw.cmd');
                this.copy('.mvn/wrapper/maven-wrapper.jar', '.mvn/wrapper/maven-wrapper.jar');
                this.copy('.mvn/wrapper/maven-wrapper.properties', '.mvn/wrapper/maven-wrapper.properties');
                this.template('_pom.xml', 'pom.xml', null, {'interpolate': INTERPOLATE_REGEX});
            }
        },

        writeServerResourceFiles: function () {

            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            this.copy(SERVER_MAIN_RES_DIR + 'banner.txt', SERVER_MAIN_RES_DIR + 'banner.txt');

            if (this.hibernateCache === 'ehcache') {
                this.template(SERVER_MAIN_RES_DIR + '_ehcache.xml', SERVER_MAIN_RES_DIR + 'ehcache.xml', this, {});
            }
            if (this.devDatabaseType === 'h2Disk' || this.devDatabaseType === 'h2Memory') {
                this.copy(SERVER_MAIN_RES_DIR + 'h2.server.properties', SERVER_MAIN_RES_DIR + '.h2.server.properties');
            }

            // Thymeleaf templates
            this.copy(SERVER_MAIN_RES_DIR + 'templates/error.html', SERVER_MAIN_RES_DIR + 'templates/error.html');

            this.template(SERVER_MAIN_RES_DIR + '_logback-spring.xml', SERVER_MAIN_RES_DIR + 'logback-spring.xml', this, {'interpolate': INTERPOLATE_REGEX});

            this.template(SERVER_MAIN_RES_DIR + 'config/_application.yml', SERVER_MAIN_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-dev.yml', SERVER_MAIN_RES_DIR + 'config/application-dev.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-prod.yml', SERVER_MAIN_RES_DIR + 'config/application-prod.yml', this, {});

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_RES_DIR + '/config/liquibase/changelog/_initial_schema.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {'interpolate': INTERPOLATE_REGEX});
                this.copy(SERVER_MAIN_RES_DIR + '/config/liquibase/master.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/master.xml');
            }

            if (this.databaseType === 'mongodb' && !this.skipUserManagement) {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/dbmigrations/_InitialSetupMigration.java', javaDir + 'config/dbmigrations/InitialSetupMigration.java', this, {});
            }

            if (this.databaseType === 'cassandra' || this.applicationType === 'gateway') {
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace-prod.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace-prod.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_drop-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/drop-keyspace.cql', this, {});
                this.copy(SERVER_MAIN_RES_DIR + 'config/cql/changelog/README.md', SERVER_MAIN_RES_DIR + 'config/cql/changelog/README.md');

                /* Skip the code below for --skip-user-management */
                if (this.skipUserManagement) return;
                if (this.applicationType !== 'microservice' && this.databaseType === 'cassandra') {
                    this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_create-tables.cql', SERVER_MAIN_RES_DIR + 'config/cql/changelog/00000000000000_create-tables.cql', this, {});
                    this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_insert_default_users.cql', SERVER_MAIN_RES_DIR + 'config/cql/changelog/00000000000001_insert_default_users.cql', this, {});
                }
            }

            if (this.applicationType === 'uaa') {
                this.generateKeyStore();
            }
        },

        writeServerPropertyFiles: function () {
            this.template('../../languages/templates/' + SERVER_MAIN_RES_DIR + 'i18n/_messages_en.properties', SERVER_MAIN_RES_DIR + 'i18n/messages.properties', this, {});
        },

        writeServerJavaAuthConfigFiles: function () {
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});

            if (this.authenticationType === 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_TokenProvider.java', javaDir + 'security/jwt/TokenProvider.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTConfigurer.java', javaDir + 'security/jwt/JWTConfigurer.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTFilter.java', javaDir + 'security/jwt/JWTFilter.java', this, {});
            }

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            if(this.applicationType === 'uaa') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_UaaWebSecurityConfiguration.java', javaDir + 'config/UaaWebSecurityConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_UaaConfiguration.java', javaDir + 'config/UaaConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoadBalancedResourceDetails.java', javaDir + 'config/LoadBalancedResourceDetails.java', this, {});
            } else {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java', this, {});
            }

            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});


            if (this.authenticationType === 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_LoginVM.java', javaDir + 'web/rest/vm/LoginVM.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserJWTController.java', javaDir + 'web/rest/UserJWTController.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_JWTToken.java', javaDir + 'web/rest/JWTToken.java', this, {});
            }

            if (this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
            }

            if (this.databaseType === 'mongodb' && this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBApprovalStore.java', javaDir + 'config/oauth2/MongoDBApprovalStore.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBAuthorizationCodeServices.java', javaDir + 'config/oauth2/MongoDBAuthorizationCodeServices.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBClientDetailsService.java', javaDir + 'config/oauth2/MongoDBClientDetailsService.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationApproval.java', javaDir + 'domain/OAuth2AuthenticationApproval.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationClientDetails.java', javaDir + 'domain/OAuth2AuthenticationClientDetails.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationCode.java', javaDir + 'domain/OAuth2AuthenticationCode.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2ApprovalRepository.java', javaDir + 'repository/OAuth2ApprovalRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2ClientDetailsRepository.java', javaDir + 'repository/OAuth2ClientDetailsRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2CodeRepository.java', javaDir + 'repository/OAuth2CodeRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
            }
            if (this.authenticationType === 'session' || this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
            }

            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_CustomAccessDeniedHandler.java', javaDir + 'security/CustomAccessDeniedHandler.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_CsrfCookieGeneratorFilter.java', javaDir + 'web/filter/CsrfCookieGeneratorFilter.java', this, {});
            }

            if (this.enableSocialSignIn) {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/social/_SocialConfiguration.java', javaDir + 'config/social/SocialConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_SocialUserConnection.java', javaDir + 'domain/SocialUserConnection.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomSocialConnectionRepository.java', javaDir + 'repository/CustomSocialConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomSocialUsersConnectionRepository.java', javaDir + 'repository/CustomSocialUsersConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_SocialUserConnectionRepository.java', javaDir + 'repository/SocialUserConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_CustomSignInAdapter.java', javaDir + 'security/social/CustomSignInAdapter.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_SocialService.java', javaDir + 'service/SocialService.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_SocialController.java', javaDir + 'web/rest/SocialController.java', this, {});
            }
        },

        writeServerJavaGatewayFiles: function () {

            if (this.applicationType !== 'gateway') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_GatewayConfiguration.java', javaDir + 'config/GatewayConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_GatewaySwaggerResourcesProvider.java', javaDir + 'config/apidoc/GatewaySwaggerResourcesProvider.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingFilter.java', javaDir + 'gateway/ratelimiting/RateLimitingFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/_TokenRelayFilter.java', javaDir + 'gateway/TokenRelayFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingRepository.java', javaDir + 'gateway/ratelimiting/RateLimitingRepository.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/accesscontrol/_AccessControlFilter.java', javaDir + 'gateway/accesscontrol/AccessControlFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/responserewriting/_SwaggerBasePathRewritingFilter.java', javaDir + 'gateway/responserewriting/SwaggerBasePathRewritingFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_RouteVM.java', javaDir + 'web/rest/vm/RouteVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_GatewayResource.java', javaDir + 'web/rest/GatewayResource.java', this, {});
        },

        writeServerMicroserviceFiles: function () {
            if (this.applicationType !== 'microservice' && !(this.applicationType === 'gateway' && this.authenticationType === 'uaa')) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MicroserviceSecurityConfiguration.java', javaDir + 'config/MicroserviceSecurityConfiguration.java', this, {});
            if (this.applicationType === 'microservice' && this.authenticationType === 'uaa') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoadBalancedResourceDetails.java', javaDir + 'config/LoadBalancedResourceDetails.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_FeignConfiguration.java', javaDir + 'config/FeignConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/client/_AuthorizedFeignClient.java', javaDir + 'client/AuthorizedFeignClient.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/client/_OAuth2InterceptedFeignConfiguration.java', javaDir + 'client/OAuth2InterceptedFeignConfiguration.java', this, {});
            }
        },

        writeServerMicroserviceAndGatewayFiles: function () {
            if (this.applicationType !== 'microservice' && this.applicationType !== 'gateway' && this.applicationType !== 'uaa') return;

            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap-dev.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap-dev.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap-prod.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap-prod.yml', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_SpectatorLogMetricWriter.java', javaDir + 'config/metrics/SpectatorLogMetricWriter.java', this, {});
        },

        writeServerJavaAppFiles: function () {

            // Create Java files
            // Spring Boot main
            this.template(SERVER_MAIN_SRC_DIR + 'package/_Application.java', javaDir + '/' + this.mainClass + '.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});
        },

        writeServerJavaConfigFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DefaultProfileUtil.java', javaDir + 'config/DefaultProfileUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_PageableParameterBuilderPlugin.java', javaDir + 'config/apidoc/PageableParameterBuilderPlugin.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_package-info.java', javaDir + 'async/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_package-info.java', javaDir + 'config/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_Constants.java', javaDir + 'config/Constants.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoggingConfiguration.java', javaDir + 'config/LoggingConfiguration.java', this, {});

            if (this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_JHipsterProperties.java', javaDir + 'config/JHipsterProperties.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java', this, {});
            if (this.websocket === 'spring-websocket') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketConfiguration.java', javaDir + 'config/WebsocketConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketSecurityConfiguration.java', javaDir + 'config/WebsocketSecurityConfiguration.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

            if (this.databaseType === 'cassandra') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_CassandraHealthIndicator.java', javaDir + 'config/metrics/CassandraHealthIndicator.java', this, {});
            }

            if (this.databaseType === 'cassandra' || this.applicationType === 'gateway') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_CassandraConfiguration.java', javaDir + 'config/cassandra/CassandraConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_CustomZonedDateTimeCodec.java', javaDir + 'config/cassandra/CustomZonedDateTimeCodec.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_package-info.java', javaDir + 'config/cassandra/package-info.java', this, {});
            }

            if (this.hibernateCache === 'hazelcast') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java', this, {});
            }

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_AsyncSpringLiquibase.java', javaDir + 'config/liquibase/AsyncSpringLiquibase.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_package-info.java', javaDir + 'config/liquibase/package-info.java', this, {});
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ElasticSearchConfiguration.java', javaDir + 'config/ElasticSearchConfiguration.java', this, {});
            }
            if (this.messageBroker === 'kafka') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MessagingConfiguration.java', javaDir + 'config/MessagingConfiguration.java', this, {});
            }
        },

        writeServerJavaDomainFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310PersistenceConverters.java', javaDir + 'domain/util/JSR310PersistenceConverters.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedH2Dialect.java', javaDir + 'domain/util/FixedH2Dialect.java', this, {});
                if (this.prodDatabaseType === 'postgresql') {
                    this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedPostgreSQL82Dialect.java', javaDir + 'domain/util/FixedPostgreSQL82Dialect.java', this, {});
                }
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
            }
        },

        writeServerJavaRepoFiles: function () {

            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_package-info.java', javaDir + 'repository/search/package-info.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
        },

        writeServerJavaServiceFiles: function () {
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});
        },

        writeServerJavaWebErrorFiles: function () {

            // error handler code - server side
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorConstants.java', javaDir + 'web/rest/errors/ErrorConstants.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_CustomParameterizedException.java', javaDir + 'web/rest/errors/CustomParameterizedException.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorVM.java', javaDir + 'web/rest/errors/ErrorVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ExceptionTranslator.java', javaDir + 'web/rest/errors/ExceptionTranslator.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_FieldErrorVM.java', javaDir + 'web/rest/errors/FieldErrorVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ParameterizedErrorVM.java', javaDir + 'web/rest/errors/ParameterizedErrorVM.java', this, {});

        },

        writeServerJavaWebFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_package-info.java', javaDir + 'web/rest/vm/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_LoggerVM.java', javaDir + 'web/rest/vm/LoggerVM.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_HeaderUtil.java', javaDir + 'web/rest/util/HeaderUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_PaginationUtil.java', javaDir + 'web/rest/util/PaginationUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_ProfileInfoResource.java', javaDir + 'web/rest/ProfileInfoResource.java', this, {});

        },

        writeServerJavaWebsocketFiles: function () {

            if (this.websocket !== 'spring-websocket') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});

        },

        writeServerTestFwFiles: function () {

            // Create Test Java files
            var testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType === 'cassandra') {
                this.template(SERVER_TEST_SRC_DIR + 'package/_CassandraKeyspaceUnitTest.java', testDir + 'CassandraKeyspaceUnitTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/_AbstractCassandraTest.java', testDir + 'AbstractCassandraTest.java', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});

            this.template(SERVER_TEST_RES_DIR + 'config/_application.yml', SERVER_TEST_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_TEST_RES_DIR + '_logback-test.xml', SERVER_TEST_RES_DIR + 'logback-test.xml', this, {});

            // Create Gateway tests files
            if (this.applicationType === 'gateway'){
                this.template(SERVER_TEST_SRC_DIR + 'package/gateway/responserewriting/_SwaggerBasePathRewritingFilterTest.java', testDir + 'gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java', this, {});
            }

            if (this.applicationType === 'gateway' || this.applicationType === 'microservice'  || this.applicationType === 'uaa'){
                this.template(SERVER_TEST_RES_DIR + 'config/_bootstrap.yml', SERVER_TEST_RES_DIR + 'config/bootstrap.yml', this, {});
            }

            if (this.authenticationType === 'uaa') {
                this.template(SERVER_TEST_SRC_DIR + 'package/security/_OAuth2TokenMockUtil.java', testDir + 'security/OAuth2TokenMockUtil.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/config/_SecurityBeanOverrideConfiguration.java', testDir + 'config/SecurityBeanOverrideConfiguration.java', this, {});
            }

            if (this.hibernateCache === 'ehcache') {
                this.template(SERVER_TEST_RES_DIR + '_ehcache.xml', SERVER_TEST_RES_DIR + 'ehcache.xml', this, {});
            }

            // Create Gatling test files
            if (this.testFrameworks.indexOf('gatling') !== -1) {
                this.copy(TEST_DIR + 'gatling/conf/gatling.conf', TEST_DIR + 'gatling/conf/gatling.conf');
                this.copy(TEST_DIR + 'gatling/conf/logback.xml', TEST_DIR + 'gatling/conf/logback.xml');
                mkdirp(TEST_DIR + 'gatling/data');
                mkdirp(TEST_DIR + 'gatling/bodies');
                mkdirp(TEST_DIR + 'gatling/simulations');
            }

            // Create Cucumber test files
            if (this.testFrameworks.indexOf('cucumber') !== -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/_CucumberTest.java', testDir + 'cucumber/CucumberTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_StepDefs.java', testDir + 'cucumber/stepdefs/StepDefs.java', this, {});
                mkdirp(TEST_DIR + 'features/');
            }

            // Create ElasticSearch test files
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_TEST_SRC_DIR + 'package/config/elasticsearch/_IndexReinitializer.java', testDir + 'config/elasticsearch/IndexReinitializer.java', this, {});
            }
        },

        writeJavaUserManagementFiles: function () {

            if (this.skipUserManagement) return;
            // user management related files

            /* User management resources files */
            if (this.databaseType === 'sql') {
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv');
                if (this.authenticationType === 'oauth2') {
                    this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/oauth_client_details.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/oauth_client_details.csv');
                }
            }

            // Email templates
            this.copy(SERVER_MAIN_RES_DIR + 'mails/activationEmail.html', SERVER_MAIN_RES_DIR + 'mails/activationEmail.html');
            this.copy(SERVER_MAIN_RES_DIR + 'mails/creationEmail.html', SERVER_MAIN_RES_DIR + 'mails/creationEmail.html');
            this.copy(SERVER_MAIN_RES_DIR + 'mails/passwordResetEmail.html', SERVER_MAIN_RES_DIR + 'mails/passwordResetEmail.html');
            if (this.enableSocialSignIn) {
                this.copy(SERVER_MAIN_RES_DIR + 'mails/socialRegistrationValidationEmail.html', SERVER_MAIN_RES_DIR + 'mails/socialRegistrationValidationEmail.html');
            }

            /* User management java domain files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_User.java', javaDir + 'domain/User.java', this, {});

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
            }

            /* User management java repo files */
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_UserSearchRepository.java', javaDir + 'repository/search/UserSearchRepository.java', this, {});
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});

            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});

            /* User management java service files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
            }

            /* User management java web files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_package-info.java', javaDir + 'service/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_UserDTO.java', javaDir + 'service/dto/UserDTO.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_ManagedUserVM.java', javaDir + 'web/rest/vm/ManagedUserVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_KeyAndPasswordVM.java', javaDir + 'web/rest/vm/KeyAndPasswordVM.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_package-info.java', javaDir + 'service/mapper/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_UserMapper.java', javaDir + 'service/mapper/UserMapper.java', this, {});


            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
            }

            /* User management java test files */
            var testDir = this.testDir;

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_UserServiceIntTest.java', testDir + 'service/UserServiceIntTest.java', this, {});
            }
            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_UserResourceIntTest.java', testDir + 'web/rest/UserResourceIntTest.java', this, {});
            if (this.enableSocialSignIn) {
                this.template(SERVER_TEST_SRC_DIR + 'package/repository/_CustomSocialUsersConnectionRepositoryIntTest.java', testDir + 'repository/CustomSocialUsersConnectionRepositoryIntTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_SocialServiceIntTest.java', testDir + 'service/SocialServiceIntTest.java', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AccountResourceIntTest.java', testDir + 'web/rest/AccountResourceIntTest.java', this, {});
            this.template(SERVER_TEST_SRC_DIR + 'package/security/_SecurityUtilsUnitTest.java', testDir + 'security/SecurityUtilsUnitTest.java', this, {});

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AuditResourceIntTest.java', testDir + 'web/rest/AuditResourceIntTest.java', this, {});
            }
            //Cucumber user management tests
            if (this.testFrameworks.indexOf('cucumber') !== -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_UserStepDefs.java', testDir + 'cucumber/stepdefs/UserStepDefs.java', this, {});
                this.copy('src/test/features/user/user.feature', 'src/test/features/user/user.feature');
            }
        }
    },

    end: function () {
        if (this.prodDatabaseType === 'oracle') {
            this.log('\n\n');
            this.warning(chalk.yellow.bold('You have selected Oracle database.\n') + 'Please rename ' +
                chalk.yellow.bold('ojdbc' + this.ojdbcVersion + '.jar') + ' to ' +
                chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' and place it in the `' +
                chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
        }
        this.log(chalk.green.bold('\nServer app generated successfully.\n'));
    }

});

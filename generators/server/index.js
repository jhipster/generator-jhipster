'use strict';
const util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    prompts = require('./prompts'),
    scriptBase = require('../generator-base'),
    writeFiles = require('./files').writeFiles,
    packagejs = require('../../package.json'),
    crypto = require('crypto'),
    os = require('os');

var JhipsterServerGenerator = generators.Base.extend({});

util.inherits(JhipsterServerGenerator, scriptBase);

/* Constants used throughout */
const constants = require('../generator-constants'),
    QUESTIONS = constants.SERVER_QUESTIONS;

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
        this.clientPackageManager = this.configOptions.clientPackageManager;
    },
    initializing: {
        displayLogo: function () {
            if (this.logo) {
                this.printJHipsterLogo();
            }
        },

        setupServerVars: function () {
            // Make constants available in templates
            this.MAIN_DIR = constants.MAIN_DIR;
            this.TEST_DIR = constants.TEST_DIR;
            this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
            this.CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
            this.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
            this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
            this.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
            this.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

            this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
            this.DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE;
            this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
            this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
            this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
            this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
            this.DOCKER_MSSQL = constants.DOCKER_MSSQL;
            this.DOCKER_ORACLE = constants.DOCKER_ORACLE;
            this.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
            this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
            this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
            this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
            this.DOCKER_SONAR = constants.DOCKER_SONAR;
            this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
            this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
            this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
            this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
            this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;

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
            this.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
            if (this.searchEngine === undefined) {
                this.searchEngine = false;
            }
            this.messageBroker = this.config.get('messageBroker') === 'no' ? false : this.config.get('messageBroker');
            if (this.messageBroker === undefined) {
                this.messageBroker = false;
            }

            this.serviceDiscoveryType = this.config.get('serviceDiscoveryType') === 'no' ? false : this.config.get('serviceDiscoveryType');
            if (this.serviceDiscoveryType === undefined) {
                this.serviceDiscoveryType = false;
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
            if (this.hibernateCache === undefined) {
                this.hibernateCache = 'no';
            }
            this.clusteredHttpSession = this.config.get('clusteredHttpSession') === 'no' ? false : this.config.get('clusteredHttpSession');
            if (this.hibernateCache === 'ehcache') {
                this.clusteredHttpSession = false; // cannot use HazelCast clusering AND ehcache
            }
            this.buildTool = this.config.get('buildTool');
            this.enableSocialSignIn = this.config.get('enableSocialSignIn');
            this.jhipsterVersion = packagejs.version;
            if (this.jhipsterVersion === undefined) {
                this.jhipsterVersion = this.config.get('jhipsterVersion');
            }
            this.authenticationType = this.config.get('authenticationType');
            if (this.authenticationType === 'session') {
                this.rememberMeKey = this.config.get('rememberMeKey');
            }
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            this.uaaBaseName = this.config.get('uaaBaseName');
            this.clientFramework = this.config.get('clientFramework');
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

                // Generate JWT secret key if key does not already exist in config
                if (this.authenticationType === 'jwt' && this.jwtSecretKey === undefined) {
                    this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
                }

                // If social sign in is not defined, it is disabled by default
                if (this.enableSocialSignIn === undefined) {
                    this.enableSocialSignIn = false;
                }

                // If the service discovery is not defined, it is disabled by default
                if (this.serviceDiscoveryType === undefined) {
                    this.serviceDiscoveryType = false;
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
                this.BUILD_DIR = 'target/';
            } else {
                this.BUILD_DIR = 'build/';
            }
            this.CLIENT_DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
            // Make documentation URL available in templates
            this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
            this.DOCUMENTATION_ARCHIVE_URL = constants.JHIPSTER_DOCUMENTATION_URL + constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH + 'v' + this.jhipsterVersion;
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

            if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
                this.pkType = 'String';
            } else {
                this.pkType = 'Long';
            }

            this.packageFolder = this.packageName.replace(/\./g, '/');
            this.testDir = constants.SERVER_TEST_SRC_DIR + this.packageFolder + '/';
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
            if (this.configOptions.clientFramework) {
                this.clientFramework = this.configOptions.clientFramework;
            }
            this.protractorTests = this.testFrameworks.indexOf('protractor') !== -1;
            this.gatlingTests = this.testFrameworks.indexOf('gatling') !== -1;
            this.cucumberTests = this.testFrameworks.indexOf('cucumber') !== -1;
        },

        composeLanguages: function () {
            if (this.configOptions.skipI18nQuestion) return;

            this.composeLanguagesSub(this, this.configOptions, 'server');
        }
    },

    writing: writeFiles(),

    end: function () {

        if (this.prodDatabaseType === 'oracle') {
            this.log('\n\n');
            this.warning(chalk.yellow.bold('You have selected Oracle database.\n') +
                'Please follow our documentation on using Oracle to set up the \n' +
                'Oracle proprietary JDBC driver.');
        }
        this.log(chalk.green.bold('\nServer application generated successfully.\n'));

        let executable = 'mvnw';
        if (this.buildTool === 'gradle') {
            executable = 'gradlew';
        }
        let logMsgComment = '';
        if (os.platform() === 'win32') {
            logMsgComment = ' (' + chalk.yellow.bold(executable) + ' if using Windows Command Prompt)';
        }
        this.log(chalk.green('Run your Spring Boot application:' +
            '\n ' + chalk.yellow.bold('./' + executable) + logMsgComment));
    }

});

'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../generator-base'),
    packagejs = require('../../package.json'),
    crypto = require("crypto"),
    mkdirp = require('mkdirp');

var JhipsterServerGenerator = generators.Base.extend({});

util.inherits(JhipsterServerGenerator, scriptBase);

/* Constants used throughout */
const constants = require('../generator-constants'),
    QUESTIONS =  constants.QUESTIONS,
    INTERPOLATE_REGEX =  constants.INTERPOLATE_REGEX,
    DOCKER_DIR = constants.DOCKER_DIR,
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    MAIN_DIR = constants.MAIN_DIR,
    TEST_DIR = constants.TEST_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR,
    SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

var currentQuestion;
var configOptions = {};
var javaDir;

module.exports = JhipsterServerGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        configOptions = this.options.configOptions || {};

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

        this.skipClient = !this.options['client-hook'] || configOptions.skipClient || this.config.get('skipClient');
        this.skipUserManagement = configOptions.skipUserManagement ||  this.config.get('skipUserManagement');
        this.enableTranslation = this.options['i18n'];
        this.testFrameworks = [];
        this.options['gatling'] &&  this.testFrameworks.push('gatling');
        this.options['cucumber'] &&  this.testFrameworks.push('cucumber');
        var lastQuestion = configOptions.lastQuestion;
        currentQuestion = lastQuestion ? lastQuestion : 0;
        this.logo = configOptions.logo;
        this.baseName = configOptions.baseName;

        // Make constants available in templates
        this.MAIN_DIR = MAIN_DIR;
        this.TEST_DIR = TEST_DIR;
        this.CLIENT_MAIN_SRC_DIR = CLIENT_MAIN_SRC_DIR;
        this.CLIENT_TEST_SRC_DIR = CLIENT_TEST_SRC_DIR;
        this.SERVER_MAIN_SRC_DIR = SERVER_MAIN_SRC_DIR;
        this.SERVER_MAIN_RES_DIR = SERVER_MAIN_RES_DIR;
        this.SERVER_TEST_SRC_DIR = SERVER_TEST_SRC_DIR;
        this.SERVER_TEST_RES_DIR = SERVER_TEST_RES_DIR;
    },
    initializing : {
        displayLogo : function () {
            if(this.logo){
                this.printJHipsterLogo();
            }
        },

        setupServerVars : function () {

            this.applicationType = this.config.get('applicationType') || configOptions.applicationType;
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.javaVersion = '8'; // Java version is forced to be 1.8. We keep the variable as it might be useful in the future.
            this.packageName = this.config.get('packageName');
            this.authenticationType = this.config.get('authenticationType');
            this.clusteredHttpSession = this.config.get('clusteredHttpSession');
            this.searchEngine = this.config.get('searchEngine');
            this.websocket = this.config.get('websocket');
            this.databaseType = this.config.get('databaseType');
            if (this.databaseType == 'mongodb') {
                this.devDatabaseType = 'mongodb';
                this.prodDatabaseType = 'mongodb';
                this.hibernateCache = 'no';
            } else if (this.databaseType == 'cassandra') {
                this.devDatabaseType = 'cassandra';
                this.prodDatabaseType = 'cassandra';
                this.hibernateCache = 'no';
            } else {
                // sql
                this.devDatabaseType = this.config.get('devDatabaseType');
                this.prodDatabaseType = this.config.get('prodDatabaseType');
                this.hibernateCache = this.config.get('hibernateCache');
            }
            this.buildTool = this.config.get('buildTool');
            this.enableSocialSignIn = this.config.get('enableSocialSignIn');
            this.packagejs = packagejs;
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            this.rememberMeKey = this.config.get('rememberMeKey');
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            var testFrameworks = this.config.get('testFrameworks');
            if (testFrameworks) {
                this.testFrameworks = testFrameworks;
            }
            var baseName = this.config.get('baseName');
            if (baseName) {
                this.baseName = baseName;
            }
            var serverConfigFound = this.packageName != null &&
            this.authenticationType != null &&
            this.hibernateCache != null &&
            this.clusteredHttpSession != null &&
            this.websocket != null &&
            this.databaseType != null &&
            this.devDatabaseType != null &&
            this.prodDatabaseType != null &&
            this.searchEngine != null &&
            this.buildTool != null;

            if (this.baseName != null && serverConfigFound) {

                // Generate remember me key if key does not already exist in config
                if (this.rememberMeKey == null) {
                    this.rememberMeKey = crypto.randomBytes(20).toString('hex');
                }

                // Generate JWT secert key if key does not already exist in config
                if (this.authenticationType == 'jwt' && this.jwtSecretKey == null) {
                    this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
                }

                // If social sign in is not defined, it is disabled by default
                if (this.enableSocialSignIn == null) {
                    this.enableSocialSignIn = false;
                }

                this.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
                'to re-generate the project...\n'));

                this.existingProject = true;
            }
        }
    },

    prompting: {

        askForModuleName: function () {
            if(this.baseName){
                return;
            }
            this.askModuleName(this, ++currentQuestion, QUESTIONS);
        },

        askForServerSideOpts: function (){
            if(this.existingProject){
                return;
            }

            var done = this.async();
            var applicationType = this.applicationType;
            var prompts = [
                {
                    type: 'input',
                    name: 'packageName',
                    validate: function (input) {
                        if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                        return 'The package name you have provided is not a valid Java package name.';
                    },
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') What is your default Java package name?',
                    default: 'com.mycompany.myapp',
                    store: true
                },
                {
                    when: function (response) {
                        return applicationType == 'monolith';
                    },
                    type: 'list',
                    name: 'authenticationType',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Which *type* of authentication would you like to use?',
                    choices: [
                        {
                            value: 'session',
                            name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)'
                        },
                        {
                            value: 'session-social',
                            name: 'HTTP Session Authentication with social login enabled (Google, Facebook, Twitter). Warning, this doesn\'t work with Cassandra!'
                        },
                        {
                            value: 'oauth2',
                            name: 'OAuth2 Authentication (stateless, with an OAuth2 server implementation)'
                        },
                        {
                            value: 'jwt',
                            name: 'JWT authentication (stateless, with a token)'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return response.authenticationType == 'session-social';
                    },
                    type: 'list',
                    name: 'databaseType',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Which *type* of database would you like to use?',
                    choices: [
                        {
                            value: 'sql',
                            name: 'SQL (H2, MySQL, PostgreSQL, Oracle)'
                        },
                        {
                            value: 'mongodb',
                            name: 'MongoDB'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return response.authenticationType != 'session-social';
                    },
                    type: 'list',
                    name: 'databaseType',
                    message: '(' + (currentQuestion) + '/' + QUESTIONS + ') Which *type* of database would you like to use?',
                    choices: [
                        {
                            value: 'sql',
                            name: 'SQL (H2, MySQL, PostgreSQL, Oracle)'
                        },
                        {
                            value: 'mongodb',
                            name: 'MongoDB'
                        },
                        {
                            value: 'cassandra',
                            name: 'Cassandra'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return response.databaseType == 'sql';
                    },
                    type: 'list',
                    name: 'prodDatabaseType',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Which *production* database would you like to use?',
                    choices: [
                        {
                            value: 'mysql',
                            name: 'MySQL'
                        },
                        {
                            value: 'postgresql',
                            name: 'PostgreSQL'
                        },
                        {
                            value: 'oracle',
                            name: 'Oracle - Warning! The Oracle JDBC driver (ojdbc) is not bundled because it is not Open Source. Please follow our documentation to install it manually.'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return (response.databaseType == 'sql' && response.prodDatabaseType == 'mysql');
                    },
                    type: 'list',
                    name: 'devDatabaseType',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Which *development* database would you like to use?',
                    choices: [
                        {
                            value: 'h2Disk',
                            name: 'H2 with disk-based persistence'
                        },
                        {
                            value: 'h2Memory',
                            name: 'H2 with in-memory persistence'
                        },
                        {
                            value: 'mysql',
                            name: 'MySQL'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return (response.databaseType == 'sql' && response.prodDatabaseType == 'postgresql');
                    },
                    type: 'list',
                    name: 'devDatabaseType',
                    message: '(' + (currentQuestion) + '/' + QUESTIONS + ') Which *development* database would you like to use?',
                    choices: [
                        {
                            value: 'h2Disk',
                            name: 'H2 with disk-based persistence'
                        },
                        {
                            value: 'h2Memory',
                            name: 'H2 with in-memory persistence'
                        },
                        {
                            value: 'postgresql',
                            name: 'PostgreSQL'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return (response.databaseType == 'sql' && response.prodDatabaseType == 'oracle');
                    },
                    type: 'list',
                    name: 'devDatabaseType',
                    message: '(' + (currentQuestion) + '/' + QUESTIONS + ') Which *development* database would you like to use?',
                    choices: [
                        {
                            value: 'h2Disk',
                            name: 'H2 with disk-based persistence'
                        },
                        {
                            value: 'h2Memory',
                            name: 'H2 with in-memory persistence'
                        },
                        {
                            value: 'oracle',
                            name: 'Oracle 12c'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return response.databaseType == 'sql';
                    },
                    type: 'list',
                    name: 'hibernateCache',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Do you want to use Hibernate 2nd level cache?',
                    choices: [
                        {
                            value: 'no',
                            name: 'No'
                        },
                        {
                            value: 'ehcache',
                            name: 'Yes, with ehcache (local cache, for a single node)'
                        },
                        {
                            value: 'hazelcast',
                            name: 'Yes, with HazelCast (distributed cache, for multiple nodes)'
                        }
                    ],
                    default: 1
                },
                {
                    when: function (response) {
                        return response.databaseType == 'sql';
                    },
                    type: 'list',
                    name: 'searchEngine',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Do you want to use a search engine in your application?',
                    choices: [
                        {
                            value: 'no',
                            name: 'No'
                        },
                        {
                            value: 'elasticsearch',
                            name: 'Yes, with ElasticSearch'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return applicationType == 'monolith' || applicationType == 'gateway';
                    },
                    type: 'list',
                    name: 'clusteredHttpSession',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Do you want to use clustered HTTP sessions?',
                    choices: [
                        {
                            value: 'no',
                            name: 'No'
                        },
                        {
                            value: 'hazelcast',
                            name: 'Yes, with HazelCast'
                        }
                    ],
                    default: 0
                },
                {
                    when: function (response) {
                        return applicationType == 'monolith' || applicationType == 'gateway';
                    },
                    type: 'list',
                    name: 'websocket',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Do you want to use WebSockets?',
                    choices: [
                        {
                            value: 'no',
                            name: 'No'
                        },
                        {
                            value: 'spring-websocket',
                            name: 'Yes, with Spring Websocket'
                        }
                    ],
                    default: 0
                },
                {
                    type: 'list',
                    name: 'buildTool',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Would you like to use Maven or Gradle for building the backend?',
                    choices: [
                        {
                            value: 'maven',
                            name: 'Maven'
                        },
                        {
                            value: 'gradle',
                            name: 'Gradle'
                        }
                    ],
                    default: 'maven'
                }
            ];

            this.prompt(prompts, function (props) {
                this.rememberMeKey = crypto.randomBytes(20).toString('hex');
                if (this.applicationType == 'microservice' || this.applicationType == 'gateway') {
                    this.authenticationType = 'jwt';
                } else {
                    // Read the authenticationType to extract the enableSocialSignIn
                    // This allows to have only one authenticationType question for the moment
                    if (props.authenticationType == 'session-social') {
                        this.authenticationType = 'session';
                        this.enableSocialSignIn = true;
                    } else {
                        this.authenticationType = props.authenticationType;
                        this.enableSocialSignIn = false;
                    }
                    props.enableSocialSignIn = this.enableSocialSignIn;
                }
                if (this.authenticationType == 'jwt') {
                    this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
                }

                this.packageName = props.packageName;
                this.hibernateCache = props.hibernateCache;
                this.clusteredHttpSession = props.clusteredHttpSession;
                this.websocket = props.websocket;
                this.databaseType = props.databaseType;
                this.devDatabaseType = props.devDatabaseType;
                this.prodDatabaseType = props.prodDatabaseType;
                this.searchEngine = props.searchEngine;
                this.buildTool = props.buildTool;
                this.enableSocialSignIn = props.enableSocialSignIn;

                if (this.databaseType == 'mongodb') {
                    this.devDatabaseType = 'mongodb';
                    this.prodDatabaseType = 'mongodb';
                    this.hibernateCache = 'no';
                } else if (this.databaseType == 'cassandra') {
                    this.devDatabaseType = 'cassandra';
                    this.prodDatabaseType = 'cassandra';
                    this.hibernateCache = 'no';
                }
                if (this.searchEngine == null) {
                    this.searchEngine = 'no';
                }

                done();
            }.bind(this));
        },

        setSharedConfigOptions : function () {
            configOptions.lastQuestion = currentQuestion;
            configOptions.packageName = this.packageName;
            configOptions.hibernateCache = this.hibernateCache;
            configOptions.clusteredHttpSession = this.clusteredHttpSession;
            configOptions.websocket = this.websocket;
            configOptions.databaseType = this.databaseType;
            configOptions.devDatabaseType = this.devDatabaseType;
            configOptions.prodDatabaseType = this.prodDatabaseType;
            configOptions.searchEngine = this.searchEngine;
            configOptions.buildTool = this.buildTool;
            configOptions.enableSocialSignIn = this.enableSocialSignIn;
            configOptions.authenticationType = this.authenticationType;
        }
    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.track('generator', 'app');
            insight.track('app/authenticationType', this.authenticationType);
            insight.track('app/hibernateCache', this.hibernateCache);
            insight.track('app/clusteredHttpSession', this.clusteredHttpSession);
            insight.track('app/websocket', this.websocket);
            insight.track('app/databaseType', this.databaseType);
            insight.track('app/devDatabaseType', this.devDatabaseType);
            insight.track('app/prodDatabaseType', this.prodDatabaseType);
            insight.track('app/searchEngine', this.searchEngine);
            insight.track('app/buildTool', this.buildTool);
            insight.track('app/enableSocialSignIn', this.enableSocialSignIn);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.angularAppName = this.getAngularAppName();
            this.camelizedBaseName = _.camelize(this.baseName);
            this.slugifiedBaseName = _.slugify(this.baseName);
            this.lowercaseBaseName = this.baseName.toLowerCase();
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

        },

        saveConfig: function () {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('baseName', this.baseName);
            this.config.set('packageName', this.packageName);
            this.config.set('packageFolder', this.packageFolder);
            this.config.set('authenticationType', this.authenticationType);
            this.config.set('hibernateCache', this.hibernateCache);
            this.config.set('clusteredHttpSession', this.clusteredHttpSession);
            this.config.set('websocket', this.websocket);
            this.config.set('databaseType', this.databaseType);
            this.config.set('devDatabaseType', this.devDatabaseType);
            this.config.set('prodDatabaseType', this.prodDatabaseType);
            this.config.set('searchEngine', this.searchEngine);
            this.config.set('buildTool', this.buildTool);
            this.config.set('enableSocialSignIn', this.enableSocialSignIn);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('rememberMeKey', this.rememberMeKey);
        }
    },

    default: {
        getSharedConfigOptions: function () {
            if(configOptions.enableTranslation != null) {
                this.enableTranslation = configOptions.enableTranslation;
            }
            this.useSass = configOptions.useSass ? configOptions.useSass : false;
            if(configOptions.testFrameworks) {
                this.testFrameworks = configOptions.testFrameworks;
            }
        }
    },

    writing : {

        writeGlobalFiles: function () {
            this.template('_README.md', 'README.md', this, {});
            this.copy('gitignore', '.gitignore');
            this.copy('gitattributes', '.gitattributes');
            this.copy('editorconfig', '.editorconfig');
            this.copy('jshintrc', '.jshintrc');
            this.template('_travis.yml', '.travis.yml', this, {});
        },

        writeDockerFiles: function () {

            // Create docker-compose file
            this.template(DOCKER_DIR + '_sonar.yml', DOCKER_DIR + 'sonar.yml', this, {});
            if (this.devDatabaseType != "h2Disk" && this.devDatabaseType != "h2Memory" && this.devDatabaseType != "oracle") {
                this.template(DOCKER_DIR + '_dev.yml', DOCKER_DIR + 'dev.yml', this, {});
            }
            if (this.prodDatabaseType != "oracle" || this.searchEngine == "elasticsearch") {
                this.template(DOCKER_DIR + '_prod.yml', DOCKER_DIR + 'prod.yml', this, {});
            }
            if (this.devDatabaseType == "cassandra") {
                this.template(DOCKER_DIR + 'cassandra/_Cassandra-Dev.Dockerfile', DOCKER_DIR + 'cassandra/Cassandra-Dev.Dockerfile', this, {});
                this.template(DOCKER_DIR + 'cassandra/_Cassandra-Prod.Dockerfile', DOCKER_DIR + 'cassandra/Cassandra-Prod.Dockerfile', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_init-dev.sh', DOCKER_DIR + 'cassandra/scripts/init-dev.sh', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_init-prod.sh', DOCKER_DIR + 'cassandra/scripts/init-prod.sh', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_entities.sh', DOCKER_DIR + 'cassandra/scripts/entities.sh', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_cassandra.sh', DOCKER_DIR + 'cassandra/scripts/cassandra.sh', this, {});
                this.template(DOCKER_DIR + 'opscenter/_Dockerfile', DOCKER_DIR + 'opscenter/Dockerfile', this, {});
            }
            if (this.applicationType == 'microservice' || this.applicationType == 'gateway') {
                this.template(DOCKER_DIR + '_registry.yml', DOCKER_DIR + 'registry.yml', this, {});
            }
        },

        writeServerBuildFiles: function () {

            switch (this.buildTool) {
                case 'gradle':
                    this.template('_build.gradle', 'build.gradle', this, {});
                    this.template('_settings.gradle', 'settings.gradle', this, {});
                    this.template('_gradle.properties', 'gradle.properties', this, {});
                    if(!this.skipClient) {
                        this.template('gradle/_yeoman.gradle', 'gradle/yeoman.gradle', this, {});
                    }
                    this.template('gradle/_sonar.gradle', 'gradle/sonar.gradle', this, {});
                    this.template('gradle/_profile_dev.gradle', 'gradle/profile_dev.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                    this.template('gradle/_profile_prod.gradle', 'gradle/profile_prod.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                    this.template('gradle/_mapstruct.gradle', 'gradle/mapstruct.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                    if (this.testFrameworks.indexOf('gatling') != -1) {
                        this.template('gradle/_gatling.gradle', 'gradle/gatling.gradle', this, {});
                    }
                    if (this.databaseType == "sql") {
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

            if (this.hibernateCache == "ehcache") {
                this.template(SERVER_MAIN_RES_DIR + '_ehcache.xml', SERVER_MAIN_RES_DIR + 'ehcache.xml', this, {});
            }
            if (this.devDatabaseType == "h2Disk" || this.devDatabaseType == "h2Memory") {
                this.copy(SERVER_MAIN_RES_DIR + 'h2.server.properties', SERVER_MAIN_RES_DIR + '.h2.server.properties');
            }

            // Thymeleaf templates
            this.copy(SERVER_MAIN_RES_DIR + 'templates/error.html', SERVER_MAIN_RES_DIR + 'templates/error.html');

            this.template(SERVER_MAIN_RES_DIR + '_logback-spring.xml', SERVER_MAIN_RES_DIR + 'logback-spring.xml', this, {'interpolate': INTERPOLATE_REGEX});

            this.template(SERVER_MAIN_RES_DIR + 'config/_application.yml', SERVER_MAIN_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-dev.yml', SERVER_MAIN_RES_DIR + 'config/application-dev.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-prod.yml', SERVER_MAIN_RES_DIR + 'config/application-prod.yml', this, {});

            if (this.databaseType == "sql") {
                this.template(SERVER_MAIN_RES_DIR + '/config/liquibase/changelog/_initial_schema.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {'interpolate': INTERPOLATE_REGEX});
                this.copy(SERVER_MAIN_RES_DIR + '/config/liquibase/master.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/master.xml');
            }

            if (this.databaseType == "mongodb") {
                this.copy(SERVER_MAIN_RES_DIR + '/config/mongeez/authorities.xml', SERVER_MAIN_RES_DIR + 'config/mongeez/authorities.xml');
                this.copy(SERVER_MAIN_RES_DIR + '/config/mongeez/master.xml', SERVER_MAIN_RES_DIR + 'config/mongeez/master.xml');
            }

            if (this.databaseType == "cassandra" || this.applicationType == 'gateway') {
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace-prod.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace-prod.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_drop-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/drop-keyspace.cql', this, {});
                this.copy(SERVER_MAIN_RES_DIR + 'config/cql/create-tables.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-tables.cql');
            }
        },

        writeServeri18nFiles: function () {

            // install all files related to i18n if translation is enabled
            if (this.enableTranslation) {
                this.installI18nResFilesByLanguage(this, SERVER_MAIN_RES_DIR, 'en');
                this.installI18nResFilesByLanguage(this, SERVER_MAIN_RES_DIR, 'fr');
            }
            this.template(SERVER_MAIN_RES_DIR + 'i18n/_messages_en.properties', SERVER_MAIN_RES_DIR + 'i18n/messages.properties', this, {});
        },

        writeServerJavaAuthConfigFiles: function () {
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});

            if (this.authenticationType == 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_TokenProvider.java', javaDir + 'security/jwt/TokenProvider.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTConfigurer.java', javaDir + 'security/jwt/JWTConfigurer.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTFilter.java', javaDir + 'security/jwt/JWTFilter.java', this, {});
            }

            /* Skip the code below for --skip-user-management */
            if(this.skipUserManagement) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java', this, {});

            if (this.authenticationType == 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});

            if (this.authenticationType == 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserJWTController.java', javaDir + 'web/rest/UserJWTController.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AuthenticationProvider.java', javaDir + 'security/AuthenticationProvider.java', this, {});
            }

            if (this.authenticationType == 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
            }

            if (this.databaseType == 'mongodb' && this.authenticationType == 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
            if (this.authenticationType == 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
            }
            if (this.authenticationType == 'session' || this.authenticationType == 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
            }

            if (this.authenticationType == 'session') {
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

            if (this.applicationType != 'gateway') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_GatewayConfiguration.java', javaDir + 'config/GatewayConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingFilter.java', javaDir + 'gateway/ratelimiting/RateLimitingFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingRepository.java', javaDir + 'gateway/ratelimiting/RateLimitingRepository.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_RouteDTO.java', javaDir + 'web/rest/dto/RouteDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_GatewayResource.java', javaDir + 'web/rest/GatewayResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_GatewaySwaggerApiResource.java', javaDir + 'web/rest/GatewaySwaggerApiResource.java', this, {});
        },

        writeServerJavaAppFiles: function () {

            // Create Java files
            // Spring Boot main
            this.template(SERVER_MAIN_SRC_DIR + 'package/_Application.java', javaDir + '/' + this.mainClass + '.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});
        },

        writeServerJavaConfigFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_package-info.java', javaDir + 'async/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_package-info.java', javaDir + 'config/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_Constants.java', javaDir + 'config/Constants.java', this, {});

            if (this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            }
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_JacksonConfiguration.java', javaDir + 'config/JacksonConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_JHipsterProperties.java', javaDir + 'config/JHipsterProperties.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java', this, {});
            if (this.websocket == 'spring-websocket') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketConfiguration.java', javaDir + 'config/WebsocketConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketSecurityConfiguration.java', javaDir + 'config/WebsocketSecurityConfiguration.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

            if (this.databaseType == 'cassandra') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_CassandraHealthIndicator.java', javaDir + 'config/metrics/CassandraHealthIndicator.java', this, {});
            }

            if (this.hibernateCache == "hazelcast") {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java', this, {});
            }

            if (this.databaseType == "sql") {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_AsyncSpringLiquibase.java', javaDir + 'config/liquibase/AsyncSpringLiquibase.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_package-info.java', javaDir + 'config/liquibase/package-info.java', this, {});
            }
            if (this.searchEngine == 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ElasticSearchConfiguration.java', javaDir + 'config/ElasticSearchConfiguration.java', this, {});
            }
        },

        writeServerJavaDomainFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310PersistenceConverters.java', javaDir + 'domain/util/JSR310PersistenceConverters.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateTimeSerializer.java', javaDir + 'domain/util/JSR310DateTimeSerializer.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310LocalDateDeserializer.java', javaDir + 'domain/util/JSR310LocalDateDeserializer.java', this, {});
            if (this.databaseType == "sql") {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedH2Dialect.java', javaDir + 'domain/util/FixedH2Dialect.java', this, {});
                if (this.prodDatabaseType == 'postgresql') {
                    this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedPostgreSQL82Dialect.java', javaDir + 'domain/util/FixedPostgreSQL82Dialect.java', this, {});
                }
            }
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
            }
        },

        writeServerJavaRepoFiles: function () {

            if (this.searchEngine == 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_package-info.java', javaDir + 'repository/search/package-info.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
        },

        writeServerJavaServiceFiles: function () {
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});
        },

        writeServerJavaWebErrorFiles: function () {

            // error handler code - server side
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorConstants.java', javaDir + 'web/rest/errors/ErrorConstants.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_CustomParameterizedException.java', javaDir + 'web/rest/errors/CustomParameterizedException.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorDTO.java', javaDir + 'web/rest/errors/ErrorDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ExceptionTranslator.java', javaDir + 'web/rest/errors/ExceptionTranslator.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_FieldErrorDTO.java', javaDir + 'web/rest/errors/FieldErrorDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ParameterizedErrorDTO.java', javaDir + 'web/rest/errors/ParameterizedErrorDTO.java', this, {});

        },

        writeServerJavaWebFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_StaticResourcesProductionFilter.java', javaDir + 'web/filter/StaticResourcesProductionFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_package-info.java', javaDir + 'web/rest/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_HeaderUtil.java', javaDir + 'web/rest/util/HeaderUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_KeyAndPasswordDTO.java', javaDir + 'web/rest/dto/KeyAndPasswordDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_PaginationUtil.java', javaDir + 'web/rest/util/PaginationUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});

        },

        writeServerJavaWebsocketFiles: function () {

            if(this.websocket != 'spring-websocket') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});

        },

        writeServerTestFwFiles: function () {

            // Create Test Java files
            var testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType == "cassandra") {
                this.template(SERVER_TEST_SRC_DIR + 'package/_CassandraKeyspaceUnitTest.java', testDir + 'CassandraKeyspaceUnitTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/_AbstractCassandraTest.java', testDir + 'AbstractCassandraTest.java', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});

            this.template(SERVER_TEST_RES_DIR + 'config/_application.yml', SERVER_TEST_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_TEST_RES_DIR + '_logback-test.xml', SERVER_TEST_RES_DIR + 'logback-test.xml', this, {});

            if (this.hibernateCache == "ehcache") {
                this.template(SERVER_TEST_RES_DIR + '_ehcache.xml', SERVER_TEST_RES_DIR + 'ehcache.xml', this, {});
            }

            // Create Gatling test files
            if (this.testFrameworks.indexOf('gatling') != -1) {
                this.copy(TEST_DIR + 'gatling/conf/gatling.conf', TEST_DIR + 'gatling/conf/gatling.conf');
                mkdirp(TEST_DIR + 'gatling/data');
                mkdirp(TEST_DIR + 'gatling/bodies');
                mkdirp(TEST_DIR + 'gatling/simulations');
            }

            // Create Cucumber test files
            if (this.testFrameworks.indexOf('cucumber') != -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/_CucumberTest.java', testDir + 'cucumber/CucumberTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_StepDefs.java', testDir + 'cucumber/stepdefs/StepDefs.java', this, {});
                mkdirp(TEST_DIR + 'features/');
            }
        },

        writeJavaUserManagementFiles : function () {

            if(this.skipUserManagement) return;
            // user management related files

            /* User management resources files */
            if (this.databaseType == "sql") {
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv');
            }

            if (this.databaseType == "mongodb") {
                this.copy(SERVER_MAIN_RES_DIR + 'config/mongeez/users.xml', SERVER_MAIN_RES_DIR + 'config/mongeez/users.xml');
                this.copy(SERVER_MAIN_RES_DIR + 'config/mongeez/social_user_connections.xml', SERVER_MAIN_RES_DIR + 'config/mongeez/social_user_connections.xml');
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

            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
            }

            /* User management java repo files */
            if (this.searchEngine == 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_UserSearchRepository.java', javaDir + 'repository/search/UserSearchRepository.java', this, {});
            }
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});

            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});

            /* User management java service files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
            }

            /* User management java web files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/dto/_ManagedUserDTO.java', javaDir + 'web/rest/dto/ManagedUserDTO.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/mapper/_UserMapper.java', javaDir + 'web/rest/mapper/UserMapper.java', this, {});


            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
            }

            /* User management java test files */
            var testDir = this.testDir;

            if (this.databaseType == "sql" || this.databaseType == "mongodb") {
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_UserServiceIntTest.java', testDir + 'service/UserServiceIntTest.java', this, {});
            }
            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_UserResourceIntTest.java', testDir + 'web/rest/UserResourceIntTest.java', this, {});
            if (this.enableSocialSignIn) {
                this.template(SERVER_TEST_SRC_DIR + 'package/repository/_CustomSocialUsersConnectionRepositoryIntTest.java', testDir + 'repository/CustomSocialUsersConnectionRepositoryIntTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_SocialServiceIntTest.java', testDir + 'service/SocialServiceIntTest.java', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AccountResourceIntTest.java', testDir + 'web/rest/AccountResourceIntTest.java', this, {});
            this.template(SERVER_TEST_SRC_DIR + 'package/security/_SecurityUtilsUnitTest.java', testDir + 'security/SecurityUtilsUnitTest.java', this, {});

            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AuditResourceIntTest.java', testDir + 'web/rest/AuditResourceIntTest.java', this, {});
            }
            //Cucumber user management tests
            if (this.testFrameworks.indexOf('cucumber') != -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_UserStepDefs.java', testDir + 'cucumber/stepdefs/UserStepDefs.java', this, {});
                this.copy('src/test/features/user/user.feature', 'src/test/features/user/user.feature');
            }
        }
    },

    end: function () {
        if (this.prodDatabaseType === 'oracle') {
            this.log(chalk.yellow.bold('\n\nYou have selected Oracle database.\n') + 'Please place the ' + chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' in the `' + chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
        }
        this.log(chalk.green.bold('\nServer app generated successfully.\n'));
    }

});

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

/* Constants used through out */
const QUESTIONS = 15; // making questions a variable to avoid updating each question by hand when adding additional options
const RESOURCE_DIR = 'src/main/resources/';
const TEST_RES_DIR = 'src/test/resources/';
const DOCKER_DIR = 'src/main/docker/';
const INTERPOLATE_REGEX = /<%=([\s\S]+?)%>/g; // so that tags in templates do not get mistreated as _ templates

var currentQuestion;
var configOptions = {};

module.exports = JhipsterServerGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        configOptions = this.options.configOptions || {};

        // This adds support for a `--base-name` flag
        this.option('base-name', {
            desc: 'Provide base name for the application, this will be overwritten if base name is found in .yo-rc file',
            type: String
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

        // This adds support for a `--last-question` flag
        this.option('last-question', {
            desc: 'Pass the last question number asked',
            type: Number
        });

        // This adds support for a `--[no-]logo` flag
        this.option('logo', {
            desc: 'Disable or enable Jhipster logo',
            type: Boolean,
            defaults: true
        });

        var skipClient = this.config.get('skipClient');
        this.skipClient = skipClient || configOptions.skipClient;
        this.enableTranslation = this.options['i18n'];
        this.baseName = this.options['base-name'];
        this.testFrameworks = [];
        var gatling = this.options['gatling'];
        gatling &&  this.testFrameworks.push('gatling');
        var cucumber = this.options['cucumber'];
        cucumber &&  this.testFrameworks.push('cucumber');
        var lastQuestion = this.options['last-question'] || configOptions.lastQuestion;
        currentQuestion = lastQuestion ? lastQuestion : 0;
        this.logo = this.options['logo'];

    },
    initializing : {
        displayLogo : function () {
            if(this.logo){
                this.printJHipsterLogo();
            }
        },

        setupServerVars : function () {

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
            this.applicationType = this.config.get('applicationType');
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
            this.javaDir = 'src/main/java/' + this.packageFolder + '/';
            this.testDir = 'src/test/java/' + this.packageFolder + '/';

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
            if(configOptions.enableTranslation) {
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

        writeServerFiles: function () {

            var packageFolder = this.packageFolder;
            var javaDir = this.javaDir;

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

            // Create Java resource files
            mkdirp(RESOURCE_DIR);
            this.copy(RESOURCE_DIR + '/banner.txt', RESOURCE_DIR + '/banner.txt');

            if (this.hibernateCache == "ehcache") {
                this.template(RESOURCE_DIR + '_ehcache.xml', RESOURCE_DIR + 'ehcache.xml', this, {});
            }
            if (this.devDatabaseType == "h2Disk" || this.devDatabaseType == "h2Memory") {
                this.copy(RESOURCE_DIR + 'h2.server.properties', RESOURCE_DIR + '.h2.server.properties');
            }

            // Thymeleaf templates
            this.copy(RESOURCE_DIR + '/templates/error.html', RESOURCE_DIR + 'templates/error.html');

            this.template(RESOURCE_DIR + '_logback-spring.xml', RESOURCE_DIR + 'logback-spring.xml', this, {'interpolate': INTERPOLATE_REGEX});

            this.template(RESOURCE_DIR + '/config/_application.yml', RESOURCE_DIR + 'config/application.yml', this, {});
            this.template(RESOURCE_DIR + '/config/_application-dev.yml', RESOURCE_DIR + 'config/application-dev.yml', this, {});
            this.template(RESOURCE_DIR + '/config/_application-prod.yml', RESOURCE_DIR + 'config/application-prod.yml', this, {});

            if (this.databaseType == "sql") {
                this.template(RESOURCE_DIR + '/config/liquibase/changelog/_initial_schema.xml', RESOURCE_DIR + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {'interpolate': INTERPOLATE_REGEX});
                this.copy(RESOURCE_DIR + '/config/liquibase/master.xml', RESOURCE_DIR + 'config/liquibase/master.xml');
                this.copy(RESOURCE_DIR + '/config/liquibase/users.csv', RESOURCE_DIR + 'config/liquibase/users.csv');
                this.copy(RESOURCE_DIR + '/config/liquibase/authorities.csv', RESOURCE_DIR + 'config/liquibase/authorities.csv');
                this.copy(RESOURCE_DIR + '/config/liquibase/users_authorities.csv', RESOURCE_DIR + 'config/liquibase/users_authorities.csv');
            }

            if (this.databaseType == "mongodb") {
                this.copy(RESOURCE_DIR + '/config/mongeez/authorities.xml', RESOURCE_DIR + 'config/mongeez/authorities.xml');
                this.copy(RESOURCE_DIR + '/config/mongeez/master.xml', RESOURCE_DIR + 'config/mongeez/master.xml');
                this.copy(RESOURCE_DIR + '/config/mongeez/users.xml', RESOURCE_DIR + 'config/mongeez/users.xml');
                this.copy(RESOURCE_DIR + '/config/mongeez/social_user_connections.xml', RESOURCE_DIR + 'config/mongeez/social_user_connections.xml');
            }

            if (this.databaseType == "cassandra") {
                this.template(RESOURCE_DIR + '/config/cql/_create-keyspace-prod.cql', RESOURCE_DIR + 'config/cql/create-keyspace-prod.cql', this, {});
                this.template(RESOURCE_DIR + '/config/cql/_create-keyspace.cql', RESOURCE_DIR + 'config/cql/create-keyspace.cql', this, {});
                this.template(RESOURCE_DIR + '/config/cql/_drop-keyspace.cql', RESOURCE_DIR + 'config/cql/drop-keyspace.cql', this, {});
                this.copy(RESOURCE_DIR + '/config/cql/create-tables.cql', RESOURCE_DIR + 'config/cql/create-tables.cql');
            }

            // Create mail templates
            this.copy(RESOURCE_DIR + '/mails/activationEmail.html', RESOURCE_DIR + 'mails/activationEmail.html');
            this.copy(RESOURCE_DIR + '/mails/creationEmail.html', RESOURCE_DIR + 'mails/creationEmail.html');
            this.copy(RESOURCE_DIR + '/mails/passwordResetEmail.html', RESOURCE_DIR + 'mails/passwordResetEmail.html');
            if (this.enableSocialSignIn) {
                this.copy(RESOURCE_DIR + '/mails/socialRegistrationValidationEmail.html', RESOURCE_DIR + 'mails/socialRegistrationValidationEmail.html');
            }

            // install all files related to i18n if translation is enabled
            if (this.enableTranslation) {
                this.installI18nResFilesByLanguage(this, RESOURCE_DIR, 'en');
                this.installI18nResFilesByLanguage(this, RESOURCE_DIR, 'fr');
            }
            this.template(RESOURCE_DIR + '/i18n/_messages_en.properties', RESOURCE_DIR + 'i18n/messages.properties', this, {});

            // Create Java files
            this.template('src/main/java/package/_Application.java', javaDir + '/Application.java', this, {});
            this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});

            this.template('src/main/java/package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java', this, {});

            this.template('src/main/java/package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java', this, {});
            this.template('src/main/java/package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java', this, {});

            this.template('src/main/java/package/async/_package-info.java', javaDir + 'async/package-info.java', this, {});
            this.template('src/main/java/package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java', this, {});

            this.template('src/main/java/package/config/_package-info.java', javaDir + 'config/package-info.java', this, {});
            this.template('src/main/java/package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java', this, {});
            this.template('src/main/java/package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java', this, {});
            this.template('src/main/java/package/config/_Constants.java', javaDir + 'config/Constants.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
            }
            if (this.databaseType == 'mongodb') {
                this.template('src/main/java/package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java', this, {});
                this.template('src/main/java/package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            }
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
            }
            this.template('src/main/java/package/config/_JacksonConfiguration.java', javaDir + 'config/JacksonConfiguration.java', this, {});
            this.template('src/main/java/package/config/_JHipsterProperties.java', javaDir + 'config/JHipsterProperties.java', this, {});
            this.template('src/main/java/package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
            this.template('src/main/java/package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
            this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});

            if (this.authenticationType == 'oauth2') {
                this.template('src/main/java/package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
            }

            if (this.databaseType == 'mongodb' && this.authenticationType == 'oauth2') {
                this.template('src/main/java/package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java', this, {});
                this.template('src/main/java/package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java', this, {});
                this.template('src/main/java/package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java', this, {});
                this.template('src/main/java/package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java', this, {});
                this.template('src/main/java/package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java', this, {});
                this.template('src/main/java/package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java', this, {});
            }

            this.template('src/main/java/package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java', this, {});
            this.template('src/main/java/package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java', this, {});
            this.template('src/main/java/package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java', this, {});
            if (this.websocket == 'spring-websocket') {
                this.template('src/main/java/package/config/_WebsocketConfiguration.java', javaDir + 'config/WebsocketConfiguration.java', this, {});
                this.template('src/main/java/package/config/_WebsocketSecurityConfiguration.java', javaDir + 'config/WebsocketSecurityConfiguration.java', this, {});
            }

            // error handler code - server side
            this.template('src/main/java/package/web/rest/errors/_ErrorConstants.java', javaDir + 'web/rest/errors/ErrorConstants.java', this, {});
            this.template('src/main/java/package/web/rest/errors/_CustomParameterizedException.java', javaDir + 'web/rest/errors/CustomParameterizedException.java', this, {});
            this.template('src/main/java/package/web/rest/errors/_ErrorDTO.java', javaDir + 'web/rest/errors/ErrorDTO.java', this, {});
            this.template('src/main/java/package/web/rest/errors/_ExceptionTranslator.java', javaDir + 'web/rest/errors/ExceptionTranslator.java', this, {});
            this.template('src/main/java/package/web/rest/errors/_FieldErrorDTO.java', javaDir + 'web/rest/errors/FieldErrorDTO.java', this, {});
            this.template('src/main/java/package/web/rest/errors/_ParameterizedErrorDTO.java', javaDir + 'web/rest/errors/ParameterizedErrorDTO.java', this, {});

            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
                this.template('src/main/java/package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});
            }

            this.template('src/main/java/package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
            this.template('src/main/java/package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

            if (this.databaseType == 'cassandra') {
                this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
                this.template('src/main/java/package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});
                this.template('src/main/java/package/config/metrics/_CassandraHealthIndicator.java', javaDir + 'config/metrics/CassandraHealthIndicator.java', this, {});
            }

            if (this.hibernateCache == "hazelcast") {
                this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java', this, {});
                this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java', this, {});
            }

            if (this.databaseType == "sql") {
                this.template('src/main/java/package/config/liquibase/_AsyncSpringLiquibase.java', javaDir + 'config/liquibase/AsyncSpringLiquibase.java', this, {});
                this.template('src/main/java/package/config/liquibase/_package-info.java', javaDir + 'config/liquibase/package-info.java', this, {});
            }

            this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
                this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
                this.template('src/main/java/package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
            }
            if (this.authenticationType == 'session') {
                this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
            }
            this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java', this, {});
            this.template('src/main/java/package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            this.template('src/main/java/package/domain/util/_JSR310PersistenceConverters.java', javaDir + 'domain/util/JSR310PersistenceConverters.java', this, {});
            this.template('src/main/java/package/domain/util/_JSR310DateTimeSerializer.java', javaDir + 'domain/util/JSR310DateTimeSerializer.java', this, {});
            this.template('src/main/java/package/domain/util/_JSR310LocalDateDeserializer.java', javaDir + 'domain/util/JSR310LocalDateDeserializer.java', this, {});
            if (this.databaseType == "sql") {
                this.template('src/main/java/package/domain/util/_FixedH2Dialect.java', javaDir + 'domain/util/FixedH2Dialect.java', this, {});
                if (this.prodDatabaseType == 'postgresql') {
                    this.template('src/main/java/package/domain/util/_FixedPostgreSQL82Dialect.java', javaDir + 'domain/util/FixedPostgreSQL82Dialect.java', this, {});
                }
            }

            if (this.searchEngine == 'elasticsearch') {
                this.template('src/main/java/package/config/_ElasticSearchConfiguration.java', javaDir + 'config/ElasticSearchConfiguration.java', this, {});
                this.template('src/main/java/package/repository/search/_package-info.java', javaDir + 'repository/search/package-info.java', this, {});
                this.template('src/main/java/package/repository/search/_UserSearchRepository.java', javaDir + 'repository/search/UserSearchRepository.java', this, {});
            }
            this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
                this.template('src/main/java/package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});
                this.template('src/main/java/package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});
            }

            this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});

            if (this.authenticationType == 'session') {
                this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
            }

            this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
            if (this.authenticationType == 'session') {
                this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
                this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
            }
            if (this.authenticationType == 'session' || this.authenticationType == 'oauth2') {
                this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
            }
            if (this.authenticationType == 'jwt') {
                this.template('src/main/java/package/security/_AuthenticationProvider.java', javaDir + 'security/AuthenticationProvider.java', this, {});
            }
            this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});
            if (this.authenticationType == 'session') {
                this.template('src/main/java/package/security/_CustomAccessDeniedHandler.java', javaDir + 'security/CustomAccessDeniedHandler.java', this, {});
                this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
            }
            this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
            this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
            }
            this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
            this.template('src/main/java/package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});

            if (this.authenticationType == 'jwt') {
                this.template('src/main/java/package/security/jwt/_TokenProvider.java', javaDir + 'security/jwt/TokenProvider.java', this, {});
                this.template('src/main/java/package/web/rest/_UserJWTController.java', javaDir + 'web/rest/UserJWTController.java', this, {});
                this.template('src/main/java/package/security/jwt/_JWTConfigurer.java', javaDir + 'security/jwt/JWTConfigurer.java', this, {});
                this.template('src/main/java/package/security/jwt/_JWTFilter.java', javaDir + 'security/jwt/JWTFilter.java', this, {});
            }

            this.template('src/main/java/package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
            }
            this.template('src/main/java/package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
            this.template('src/main/java/package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
            this.template('src/main/java/package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});

            this.template('src/main/java/package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
            this.template('src/main/java/package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
            this.template('src/main/java/package/web/filter/_StaticResourcesProductionFilter.java', javaDir + 'web/filter/StaticResourcesProductionFilter.java', this, {});
            if (this.authenticationType == 'session') {
                this.template('src/main/java/package/web/filter/_CsrfCookieGeneratorFilter.java', javaDir + 'web/filter/CsrfCookieGeneratorFilter.java', this, {});
            }

            this.template('src/main/java/package/web/rest/dto/_package-info.java', javaDir + 'web/rest/dto/package-info.java', this, {});
            this.template('src/main/java/package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java', this, {});
            this.template('src/main/java/package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java', this, {});
            this.template('src/main/java/package/web/rest/dto/_ManagedUserDTO.java', javaDir + 'web/rest/dto/ManagedUserDTO.java', this, {});
            this.template('src/main/java/package/web/rest/util/_HeaderUtil.java', javaDir + 'web/rest/util/HeaderUtil.java', this, {});
            this.template('src/main/java/package/web/rest/dto/_KeyAndPasswordDTO.java', javaDir + 'web/rest/dto/KeyAndPasswordDTO.java', this, {});

            this.template('src/main/java/package/web/rest/util/_PaginationUtil.java', javaDir + 'web/rest/util/PaginationUtil.java', this, {});
            this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});
            this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/main/java/package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
            }
            this.template('src/main/java/package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});
            this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});

            if (this.websocket == 'spring-websocket') {
                this.template('src/main/java/package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
                this.template('src/main/java/package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
                this.template('src/main/java/package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
                this.template('src/main/java/package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});
            }

            if (this.enableSocialSignIn) {
                this.template('src/main/java/package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template('src/main/java/package/config/social/_SocialConfiguration.java', javaDir + 'config/social/SocialConfiguration.java', this, {});
                this.template('src/main/java/package/domain/_SocialUserConnection.java', javaDir + 'domain/SocialUserConnection.java', this, {});
                this.template('src/main/java/package/repository/_CustomSocialConnectionRepository.java', javaDir + 'repository/CustomSocialConnectionRepository.java', this, {});
                this.template('src/main/java/package/repository/_CustomSocialUsersConnectionRepository.java', javaDir + 'repository/CustomSocialUsersConnectionRepository.java', this, {});
                this.template('src/main/java/package/repository/_SocialUserConnectionRepository.java', javaDir + 'repository/SocialUserConnectionRepository.java', this, {});
                this.template('src/main/java/package/security/social/_CustomSignInAdapter.java', javaDir + 'security/social/CustomSignInAdapter.java', this, {});
                this.template('src/main/java/package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template('src/main/java/package/service/_SocialService.java', javaDir + 'service/SocialService.java', this, {});
                this.template('src/main/java/package/web/rest/_SocialController.java', javaDir + 'web/rest/SocialController.java', this, {});
            }

        },


        writeServerTestFwFiles: function () {

            // Create Test Java files
            var testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType == "cassandra") {
                this.template('src/test/java/package/_CassandraKeyspaceUnitTest.java', testDir + 'CassandraKeyspaceUnitTest.java', this, {});
                this.template('src/test/java/package/_AbstractCassandraTest.java', testDir + 'AbstractCassandraTest.java', this, {});
            }
            this.template('src/test/java/package/security/_SecurityUtilsUnitTest.java', testDir + 'security/SecurityUtilsUnitTest.java', this, {});
            if (this.databaseType == "sql" || this.databaseType == "mongodb") {
                this.template('src/test/java/package/service/_UserServiceIntTest.java', testDir + 'service/UserServiceIntTest.java', this, {});
            }
            this.template('src/test/java/package/web/rest/_AccountResourceIntTest.java', testDir + 'web/rest/AccountResourceIntTest.java', this, {});
            if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
                this.template('src/test/java/package/web/rest/_AuditResourceIntTest.java', testDir + 'web/rest/AuditResourceIntTest.java', this, {});
            }
            this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});
            this.template('src/test/java/package/web/rest/_UserResourceIntTest.java', testDir + 'web/rest/UserResourceIntTest.java', this, {});

            this.template(TEST_RES_DIR + 'config/_application.yml', TEST_RES_DIR + 'config/application.yml', this, {});
            this.template(TEST_RES_DIR + '_logback-test.xml', TEST_RES_DIR + 'logback-test.xml', this, {});

            if (this.hibernateCache == "ehcache") {
                this.template(TEST_RES_DIR + '_ehcache.xml', TEST_RES_DIR + 'ehcache.xml', this, {});
            }

            if (this.enableSocialSignIn) {
                this.template('src/test/java/package/repository/_CustomSocialUsersConnectionRepositoryIntTest.java', testDir + 'repository/CustomSocialUsersConnectionRepositoryIntTest.java', this, {});
                this.template('src/test/java/package/service/_SocialServiceIntTest.java', testDir + 'service/SocialServiceIntTest.java', this, {});
            }

            // Create Gatling test files
            if (this.testFrameworks.indexOf('gatling') != -1) {
                this.copy('src/test/gatling/conf/gatling.conf', 'src/test/gatling/conf/gatling.conf');
                mkdirp('src/test/gatling/data');
                mkdirp('src/test/gatling/bodies');
                mkdirp('src/test/gatling/simulations');
            }

            // Create Cucumber test files
            if (this.testFrameworks.indexOf('cucumber') != -1) {
                this.template('src/test/java/package/cucumber/_CucumberTest.java', testDir + 'cucumber/CucumberTest.java', this, {});
                this.template('src/test/java/package/cucumber/_UserStepDefs.java', testDir + 'cucumber/UserStepDefs.java', this, {});
                this.copy('src/test/features/user.feature', 'src/test/features/user.feature');
            }

        }
    },

    end: function () {
        if (this.prodDatabaseType === 'oracle') {
            this.log(chalk.yellow.bold('\n\nYou have selected Oracle database.\n') + 'Please place the ' + chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' in the `' + chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
        }
        this.log(chalk.green.bold('\nServer app generated succesfully.\n'));
    }

});

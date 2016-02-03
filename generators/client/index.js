'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../generator-base'),
    cleanup = require('../cleanup'),
    packagejs = require('../../package.json'),
    crypto = require("crypto"),
    mkdirp = require('mkdirp'),
    html = require("html-wiring"),
    ejs = require('ejs');

var JhipsterGenerator = generators.Base.extend({});

util.inherits(JhipsterGenerator, scriptBase);

/* Constants use through out */
const QUESTIONS = 15; // making questions a variable to avoid updating each question by hand when adding additional options
const RESOURCE_DIR = 'src/main/resources/';
const WEBAPP_DIR = 'src/main/webapp/';
const ANGULAR_DIR = WEBAPP_DIR + 'app/';
const TEST_JS_DIR = 'src/test/javascript/';
const TEST_RES_DIR = 'src/test/resources/';
const DOCKER_DIR = 'src/main/docker/';
const INTERPOLATE_REGEX = /<%=([\s\S]+?)%>/g; // so that tags in templates do not get mistreated as _ templates

module.exports = JhipsterGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip the client side app generation',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--[no-]i18n` flag
        this.option('i18n', {
            desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
            type: Boolean,
            defaults: true
        });
        // This adds support for a `--with-entities` flag
        this.option('with-entities', {
            desc: 'Regenerate the existing entities if any',
            type: Boolean,
            defaults: false
        });
        var skipClient = this.config.get('skipClient');
        this.skipClient = this.options['skip-client'] || skipClient;
        this.i18n = this.options['i18n'];
        this.withEntities = this.options['with-entities'];

    },
    initializing : {
        displayLogo : function () {
            this.log(' \n' +
            chalk.green('        ██') + chalk.red('  ██    ██  ████████  ███████    ██████  ████████  ████████  ███████\n') +
            chalk.green('        ██') + chalk.red('  ██    ██     ██     ██    ██  ██          ██     ██        ██    ██\n') +
            chalk.green('        ██') + chalk.red('  ████████     ██     ███████    █████      ██     ██████    ███████\n') +
            chalk.green('  ██    ██') + chalk.red('  ██    ██     ██     ██             ██     ██     ██        ██   ██\n') +
            chalk.green('   ██████ ') + chalk.red('  ██    ██  ████████  ██        ██████      ██     ████████  ██    ██\n'));
            this.log(chalk.white.bold('                            http://jhipster.github.io\n'));
            this.log(chalk.white('Welcome to the JHipster Generator ') + chalk.yellow('v' + packagejs.version + '\n'));
        },

        setupClientVars : function () {
            if(this.skipClient){
                return;
            }
            this.useSass = this.config.get('useSass');
            if (this.useSass == undefined) {
                // backward compatibility for existing compass users
                this.useSass = this.config.get('useCompass');
            }
            this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
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
        },

        setupVars : function () {
            this.packagejs = packagejs;
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            this.applicationType = this.config.get('applicationType');
            this.baseName = this.config.get('baseName');
            this.rememberMeKey = this.config.get('rememberMeKey');
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.testFrameworks = this.config.get('testFrameworks');

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

            var clientConfigFound = this.useSass != null;

            if (this.baseName != null && serverConfigFound &&
                (this.skipClient || clientConfigFound)) {

                // Generate remember me key if key does not already exist in config
                if (this.rememberMeKey == null) {
                    this.rememberMeKey = crypto.randomBytes(20).toString('hex');
                }

                // Generate JWT secert key if key does not already exist in config
                if (this.authenticationType == 'jwt' && this.jwtSecretKey == null) {
                    this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
                }

                // If translation is not defined, it is enabled by default
                if (!this.skipClient && this.enableTranslation == null) {
                    this.enableTranslation = true;
                }

                // backward compatibility on testing frameworks
                if (this.testFrameworks == null) {
                    this.testFrameworks = [ 'gatling' ];
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
        askForInsightOptIn: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();
            var insight = this.insight();
            this.prompt({
                when: function () {
                    return insight.optOut === undefined;
                },
                type: 'confirm',
                name: 'insight',
                message: 'May ' + chalk.cyan('JHipster') + ' anonymously report usage statistics to improve the tool over time?',
                default: true
            }, function (prompt) {
                if (prompt.insight !== undefined) {
                    insight.optOut = !prompt.insight;
                }
                done();
            }.bind(this));
        },

        askForApplicationType: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();

            this.prompt({
                type: 'list',
                name: 'applicationType',
                message: '(1/' + QUESTIONS + ') Which *type* of application would you like to create?',
                choices: [
                    {
                        value: 'monolith',
                        name: 'Monolithic application'
                    },
                    {
                        value: 'microservice',
                        name: 'Microservice application'
                    },
                    {
                        value: 'gateway',
                        name: 'Microservice gateway'
                    }
                ],
                default: 0
            }, function (prompt) {
                this.applicationType = prompt.applicationType;
                done();
            }.bind(this));
        },

        askForModuleName: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();
            var defaultAppBaseName = (/^[a-zA-Z0-9_]+$/.test(path.basename(process.cwd())))?path.basename(process.cwd()):'jhipster';

            this.prompt({
                type: 'input',
                name: 'baseName',
                validate: function (input) {
                    if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                    return 'Your application name cannot contain special characters or a blank space, using the default name instead';
                },
                message: '(2/' + QUESTIONS + ') What is the base name of your application?',
                default: defaultAppBaseName
            }, function (prompt) {
                this.baseName = prompt.baseName;
                this.rememberMeKey = crypto.randomBytes(20).toString('hex');
                done();
            }.bind(this));
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
                    message: '(3/' + QUESTIONS + ') What is your default Java package name?',
                    default: 'com.mycompany.myapp',
                    store: true
                },
                {
                    type: 'list',
                    name: 'authenticationType',
                    message: '(4/' + QUESTIONS + ') Which *type* of authentication would you like to use?',
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
                    message: '(5/' + QUESTIONS + ') Which *type* of database would you like to use?',
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
                    message: '(5/' + QUESTIONS + ') Which *type* of database would you like to use?',
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
                    message: '(6/' + QUESTIONS + ') Which *production* database would you like to use?',
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
                    message: '(7/' + QUESTIONS + ') Which *development* database would you like to use?',
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
                    message: '(7/' + QUESTIONS + ') Which *development* database would you like to use?',
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
                    message: '(7/' + QUESTIONS + ') Which *development* database would you like to use?',
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
                    message: '(8/' + QUESTIONS + ') Do you want to use Hibernate 2nd level cache?',
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
                    message: '(9/' + QUESTIONS + ') Do you want to use a search engine in your application?',
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
                    message: '(10/' + QUESTIONS + ') Do you want to use clustered HTTP sessions?',
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
                    message: '(11/' + QUESTIONS + ') Do you want to use WebSockets?',
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
                    message: '(12/' + QUESTIONS + ') Would you like to use Maven or Gradle for building the backend?',
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

        askForClientSideOpts: function () {
            if(this.existingProject || this.skipClient){
                return;
            }
            var done = this.async();
            var prompts = [
                {
                    type: 'confirm',
                    name: 'useSass',
                    message: '(13/' + QUESTIONS + ') Would you like to use the LibSass stylesheet preprocessor for your CSS?',
                    default: false
                },
                {
                    type: 'confirm',
                    name: 'enableTranslation',
                    message: '(14/' + QUESTIONS + ') Would you like to enable translation support with Angular Translate?',
                    default: true
                }
            ];
            this.prompt(prompts, function (props) {

                this.useSass = props.useSass;
                this.enableTranslation = props.enableTranslation;

                done();
            }.bind(this));
        },

        askForTestOpts: function () {
            if(this.existingProject){
                return;
            }
            var choices = [
                {name: 'Gatling', value: 'gatling'},
                {name: 'Cucumber', value: 'cucumber'}
            ];
            if(!this.skipClient){
                // all client side test frameworks are addded here
                choices.push(
                    {name: 'Protractor', value: 'protractor'}
                );
            }
            var done = this.async();

            this.prompt({
                type: 'checkbox',
                name: 'testFrameworks',
                message: '(15/' + QUESTIONS + ') Which testing frameworks would you like to use?',
                choices: choices,
                default: [ 'gatling' ]
            }, function (prompt) {
                this.testFrameworks = prompt.testFrameworks;
                done();
            }.bind(this));
        }
    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.track('generator', 'app');
            insight.track('app/applicationType', this.applicationType);
            insight.track('app/authenticationType', this.authenticationType);
            insight.track('app/hibernateCache', this.hibernateCache);
            insight.track('app/clusteredHttpSession', this.clusteredHttpSession);
            insight.track('app/websocket', this.websocket);
            insight.track('app/databaseType', this.databaseType);
            insight.track('app/devDatabaseType', this.devDatabaseType);
            insight.track('app/prodDatabaseType', this.prodDatabaseType);
            insight.track('app/searchEngine', this.searchEngine);
            insight.track('app/useSass', this.useSass);
            insight.track('app/buildTool', this.buildTool);
            insight.track('app/enableTranslation', this.enableTranslation);
            insight.track('app/enableSocialSignIn', this.enableSocialSignIn);
            insight.track('app/testFrameworks', this.testFrameworks);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
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
            if(this.skipClient){
                this.enableTranslation = this.i18n;
            }
        },

        saveConfig: function () {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('applicationType', this.applicationType);
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
            this.config.set('useSass', this.useSass);
            this.config.set('buildTool', this.buildTool);
            this.config.set('enableTranslation', this.enableTranslation);
            this.config.set('enableSocialSignIn', this.enableSocialSignIn);
            this.config.set('rememberMeKey', this.rememberMeKey);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('testFrameworks', this.testFrameworks);
            if(this.skipClient){
                this.config.set('skipClient', true);
            }
        }
    },

    writing: {
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

        writeClientFiles: function () {
            if(this.skipClient){
                return;
            }

            this.template('_package.json', 'package.json', this, {});
            this.template('_bower.json', 'bower.json', this, {});
            this.template('bowerrc', '.bowerrc', this, {});
            this.template('gulpfile.js', 'gulpfile.js', this, {});
            this.fs.copy(this.templatePath('gulp/handleErrors.js'), this.destinationPath('gulp/handleErrors.js')); // to avoid interpolate errors
            this.template('gulp/utils.js', 'gulp/utils.js', this, {});

            // Create Webapp
            mkdirp(WEBAPP_DIR);

            // normal CSS or SCSS?
            if (this.useSass) {
                this.template(WEBAPP_DIR + 'scss/main.scss', WEBAPP_DIR + 'scss/main.scss');
                this.template(WEBAPP_DIR + 'scss/vendor.scss', WEBAPP_DIR + 'scss/vendor.scss');
            }
            // this css file will be overwritten by the sass generated css if sass is enabled
            // but this will avoid errors when running app without running sass task first
            this.template(WEBAPP_DIR + 'content/css/main.css', WEBAPP_DIR + 'content/css/main.css');

            // HTML5 BoilerPlate
            this.copy(WEBAPP_DIR + 'favicon.ico', WEBAPP_DIR + 'favicon.ico');
            this.copy(WEBAPP_DIR + 'robots.txt', WEBAPP_DIR + 'robots.txt');
            this.copy(WEBAPP_DIR + 'htaccess.txt', WEBAPP_DIR + '.htaccess');
            this.copy(WEBAPP_DIR + '404.html', WEBAPP_DIR + '404.html');

            // install all files related to i18n if translation is enabled
            if (this.enableTranslation) {
                this.installI18nFilesByLanguage(this, WEBAPP_DIR, RESOURCE_DIR, 'en');
                this.installI18nFilesByLanguage(this, WEBAPP_DIR, RESOURCE_DIR, 'fr');
            }
            this.template(RESOURCE_DIR + '/i18n/_messages_en.properties', RESOURCE_DIR + 'i18n/messages.properties', this, {});

            // Swagger-ui for Jhipster
            this.template(WEBAPP_DIR + '/swagger-ui/_index.html', WEBAPP_DIR + 'swagger-ui/index.html', this, {});
            this.copy(WEBAPP_DIR + '/swagger-ui/images/throbber.gif', WEBAPP_DIR + 'swagger-ui/images/throbber.gif');

            // Angular JS module
            this.template(ANGULAR_DIR + '_app.module.js', ANGULAR_DIR + 'app.module.js', this, {});
            this.template(ANGULAR_DIR + '_app.config.js', ANGULAR_DIR + 'app.config.js', this, {});
            this.template(ANGULAR_DIR + '_app.constants.js', ANGULAR_DIR + 'app.constants.js', this, {});

            // account module
            this.template(ANGULAR_DIR + 'account/_account.js', ANGULAR_DIR + 'account/account.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.js', ANGULAR_DIR + 'account/activate/activate.js', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.controller.js', ANGULAR_DIR + 'account/activate/activate.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/login/login.html', ANGULAR_DIR + 'account/login/login.html');
            this.copyJs(ANGULAR_DIR + 'account/login/_login.js', ANGULAR_DIR + 'account/login/login.js', this, {});
            this.template(ANGULAR_DIR + 'account/login/_login.controller.js', ANGULAR_DIR + 'account/login/login.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.js', ANGULAR_DIR + 'account/password/password.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.controller.js', ANGULAR_DIR + 'account/password/password.controller.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.directive.js', ANGULAR_DIR + 'account/password/password.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.js', ANGULAR_DIR + 'account/register/register.js', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.controller.js', ANGULAR_DIR + 'account/register/register.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/request/reset.request.html', ANGULAR_DIR + 'account/reset/request/reset.request.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/request/_reset.request.js', ANGULAR_DIR + 'account/reset/request/reset.request.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset.request.controller.js', ANGULAR_DIR + 'account/reset/request/reset.request.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/finish/reset.finish.html', ANGULAR_DIR + 'account/reset/finish/reset.finish.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/finish/_reset.finish.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset.finish.controller.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.controller.js', this, {});
            if (this.authenticationType == 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.js', ANGULAR_DIR + 'account/sessions/sessions.js', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.controller.js', ANGULAR_DIR + 'account/sessions/sessions.controller.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/settings.html', ANGULAR_DIR + 'account/settings/settings.html');
            this.copyJs(ANGULAR_DIR + 'account/settings/_settings.js', ANGULAR_DIR + 'account/settings/settings.js', this, {});
            this.template(ANGULAR_DIR + 'account/settings/_settings.controller.js', ANGULAR_DIR + 'account/settings/settings.controller.js', this, {});
            // Social
            if (this.enableSocialSignIn) {
                this.copyHtml(ANGULAR_DIR + 'account/social/directive/_social.html', ANGULAR_DIR + 'account/social/directive/social.html');
                this.template(ANGULAR_DIR + 'account/social/directive/_social.directive.js', ANGULAR_DIR + 'account/social/directive/social.directive.js', this, {});
                this.copyHtml(ANGULAR_DIR + 'account/social/_social-register.html', ANGULAR_DIR + 'account/social/social-register.html');
                this.template(ANGULAR_DIR + 'account/social/_social-register.controller.js', ANGULAR_DIR + 'account/social/social-register.controller.js', this, {});
                this.template(ANGULAR_DIR + 'account/social/_social.service.js', ANGULAR_DIR + 'account/social/social.service.js', this, {});
                this.copyJs(ANGULAR_DIR + 'account/social/_social-register.js', ANGULAR_DIR + 'account/social/social-register.js', this, {});
            }

            // admin modules
            this.template(ANGULAR_DIR + 'admin/_admin.js', ANGULAR_DIR + 'admin/admin.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/audits/audits.html', ANGULAR_DIR + 'admin/audits/audits.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.js', ANGULAR_DIR + 'admin/audits/audits.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.controller.js', ANGULAR_DIR + 'admin/audits/audits.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.js', ANGULAR_DIR + 'admin/audits/audits.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.js', ANGULAR_DIR + 'admin/configuration/configuration.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.controller.js', ANGULAR_DIR + 'admin/configuration/configuration.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.js', ANGULAR_DIR + 'admin/configuration/configuration.service.js', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.js', ANGULAR_DIR + 'admin/docs/docs.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.modal.html', ANGULAR_DIR + 'admin/health/health.modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.js', ANGULAR_DIR + 'admin/health/health.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.controller.js', ANGULAR_DIR + 'admin/health/health.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.modal.controller.js', ANGULAR_DIR + 'admin/health/health.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.js', ANGULAR_DIR + 'admin/health/health.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
            this.copyJs(ANGULAR_DIR + 'admin/logs/_logs.js', ANGULAR_DIR + 'admin/logs/logs.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.controller.js', ANGULAR_DIR + 'admin/logs/logs.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.service.js', ANGULAR_DIR + 'admin/logs/logs.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.html', ANGULAR_DIR + 'admin/metrics/metrics.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.modal.html', ANGULAR_DIR + 'admin/metrics/metrics.modal.html', this, {}, true);
            this.copyJs(ANGULAR_DIR + 'admin/metrics/_metrics.js', ANGULAR_DIR + 'admin/metrics/metrics.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.modal.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.service.js', ANGULAR_DIR + 'admin/metrics/metrics.service.js', this, {});
            if (this.websocket == 'spring-websocket') {
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.js', ANGULAR_DIR + 'admin/tracker/tracker.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.controller.js', ANGULAR_DIR + 'admin/tracker/tracker.controller.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.service.js', ANGULAR_DIR + 'admin/tracker/tracker.service.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/user-management.html', ANGULAR_DIR + 'admin/user-management/user-management.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-detail.html', ANGULAR_DIR + 'admin/user-management/user-management-detail.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-dialog.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.html');
            this.copyJs(ANGULAR_DIR + 'admin/user-management/_user-management.js', ANGULAR_DIR + 'admin/user-management/user-management.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management.controller.js', ANGULAR_DIR + 'admin/user-management/user-management.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-detail.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-detail.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-dialog.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.controller.js', this, {});

            //components
            this.template(ANGULAR_DIR + 'components/form/_form.directive.js', ANGULAR_DIR + 'components/form/form.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_maxbytes.directive.js', ANGULAR_DIR + 'components/form/maxbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_minbytes.directive.js', ANGULAR_DIR + 'components/form/minbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pager.config.js', ANGULAR_DIR + 'components/form/uib-pager.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pagination.config.js', ANGULAR_DIR + 'components/form/uib-pagination.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_pagination.constants.js', ANGULAR_DIR + 'components/form/pagination.constants.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'components/language/_language.controller.js', ANGULAR_DIR + 'components/language/language.controller.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.service.js', ANGULAR_DIR + 'components/language/language.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'components/util/_base64.service.js', ANGULAR_DIR + 'components/util/base64.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_capitalize.filter.js', ANGULAR_DIR + 'components/util/capitalize.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_parse-links.service.js', ANGULAR_DIR + 'components/util/parse-links.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate.filter.js', ANGULAR_DIR + 'components/util/truncate.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_date-util.service.js', ANGULAR_DIR + 'components/util/date-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_data-util.service.js', ANGULAR_DIR + 'components/util/data-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort.directive.js', ANGULAR_DIR + 'components/util/sort.directive.js', this, {});
            // interceptor code
            this.template(ANGULAR_DIR + 'components/interceptor/_auth.interceptor.js', ANGULAR_DIR + 'components/interceptor/auth.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'components/interceptor/_errorhandler.interceptor.js', ANGULAR_DIR + 'components/interceptor/errorhandler.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'components/interceptor/_notification.interceptor.js', ANGULAR_DIR + 'components/interceptor/notification.interceptor.js', this, {});

            //alert service code
            this.template(ANGULAR_DIR + 'components/alert/_alert.service.js', ANGULAR_DIR + 'components/alert/alert.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert.directive.js', ANGULAR_DIR + 'components/alert/alert.directive.js', this, {});

            // entities
            this.copyJs(ANGULAR_DIR + 'entities/_entity.js', ANGULAR_DIR + 'entities/entity.js', this, {});

            // home module
            this.copyHtml(ANGULAR_DIR + 'home/home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.js', ANGULAR_DIR + 'home/home.js', this, {});
            this.template(ANGULAR_DIR + 'home/_home.controller.js', ANGULAR_DIR + 'home/home.controller.js', this, {});

            // layouts
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.directive.js', ANGULAR_DIR + 'layouts/navbar/navbar.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.controller.js', ANGULAR_DIR + 'layouts/navbar/navbar.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyHtml(ANGULAR_DIR + 'layouts/error/accessdenied.html', ANGULAR_DIR + 'layouts/error/accessdenied.html');
            this.copyJs(ANGULAR_DIR + 'layouts/error/_error.js', ANGULAR_DIR + 'layouts/error/error.js', this, {});

            // services
            this.template(ANGULAR_DIR + 'services/auth/_auth.service.js', ANGULAR_DIR + 'services/auth/auth.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_principal.service.js', ANGULAR_DIR + 'services/auth/principal.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_authority.directive.js', ANGULAR_DIR + 'services/auth/authority.directive.js', this, {});
            if (this.authenticationType == 'oauth2') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.oauth2.service.js', ANGULAR_DIR + 'services/auth/auth.oauth2.service.js', this, {});
            } else if (this.authenticationType == 'jwt') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.jwt.service.js', ANGULAR_DIR + 'services/auth/auth.jwt.service.js', this, {});
            } else {
                this.template(ANGULAR_DIR + 'services/auth/_auth.session.service.js', ANGULAR_DIR + 'services/auth/auth.session.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'services/auth/_account.service.js', ANGULAR_DIR + 'services/auth/account.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_activate.service.js', ANGULAR_DIR + 'services/auth/activate.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_password.service.js', ANGULAR_DIR + 'services/auth/password.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_register.service.js', ANGULAR_DIR + 'services/auth/register.service.js', this, {});
            if (this.authenticationType == 'session') {
                this.template(ANGULAR_DIR + 'services/auth/_sessions.service.js', ANGULAR_DIR + 'services/auth/sessions.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'services/user/_user.service.js', ANGULAR_DIR + 'services/user/user.service.js', this, {});

            // CSS
            this.copy(WEBAPP_DIR + 'content/css/documentation.css', WEBAPP_DIR + 'content/css/documentation.css');

            // Images
            this.copy(WEBAPP_DIR + 'content/images/development_ribbon.png', WEBAPP_DIR + 'content/images/development_ribbon.png');
            this.copy(WEBAPP_DIR + 'content/images/hipster.png', WEBAPP_DIR + 'content/images/hipster.png');
            this.copy(WEBAPP_DIR + 'content/images/hipster2x.png', WEBAPP_DIR + 'content/images/hipster2x.png');

        },

        updateJsToHtml: function () {
            if(this.skipClient){
                return;
            }
            // Index page
            var indexFile = html.readFileAsString(path.join(this.sourceRoot(), WEBAPP_DIR + '_index.html'));
            var engine = ejs.render;
            indexFile = engine(indexFile, this, {});

            var appScripts = [
                'app/app.module.js',
                'app/app.config.js',
                'app/app.constants.js',
                // account
                'app/account/account.js',
                'app/account/activate/activate.js',
                'app/account/activate/activate.controller.js',
                'app/account/login/login.js',
                'app/account/login/login.controller.js',
                'app/account/password/password.js',
                'app/account/password/password.controller.js',
                'app/account/password/password.directive.js',
                'app/account/register/register.js',
                'app/account/register/register.controller.js',
                'app/account/settings/settings.js',
                'app/account/settings/settings.controller.js',
                'app/account/reset/finish/reset.finish.controller.js',
                'app/account/reset/finish/reset.finish.js',
                'app/account/reset/request/reset.request.controller.js',
                'app/account/reset/request/reset.request.js',
                // admin
                'app/admin/admin.js',
                'app/admin/audits/audits.js',
                'app/admin/audits/audits.controller.js',
                'app/admin/audits/audits.service.js',
                'app/admin/configuration/configuration.js',
                'app/admin/configuration/configuration.controller.js',
                'app/admin/configuration/configuration.service.js',
                'app/admin/docs/docs.js',
                'app/admin/health/health.js',
                'app/admin/health/health.controller.js',
                'app/admin/health/health.service.js',
                'app/admin/health/health.modal.controller.js',
                'app/admin/logs/logs.js',
                'app/admin/logs/logs.controller.js',
                'app/admin/logs/logs.service.js',
                'app/admin/metrics/metrics.js',
                'app/admin/metrics/metrics.controller.js',
                'app/admin/metrics/metrics.service.js',
                'app/admin/metrics/metrics.modal.controller.js',
                'app/admin/user-management/user-management-detail.controller.js',
                'app/admin/user-management/user-management-dialog.controller.js',
                'app/admin/user-management/user-management-delete-dialog.controller.js',
                'app/admin/user-management/user-management.controller.js',
                'app/admin/user-management/user-management.js',
                // components
                'app/components/form/form.directive.js',
                'app/components/form/maxbytes.directive.js',
                'app/components/form/minbytes.directive.js',
                'app/components/form/uib-pager.config.js',
                'app/components/form/uib-pagination.config.js',
                'app/components/form/pagination.constants.js',
                'app/components/interceptor/auth.interceptor.js',
                'app/components/interceptor/errorhandler.interceptor.js',
                'app/components/interceptor/notification.interceptor.js',
                'app/components/util/truncate.filter.js',
                'app/components/util/base64.service.js',
                'app/components/util/capitalize.filter.js',
                'app/components/alert/alert.service.js',
                'app/components/alert/alert.directive.js',
                'app/components/util/parse-links.service.js',
                'app/components/util/date-util.service.js',
                'app/components/util/data-util.service.js',
                'app/components/util/sort.directive.js',
                // entities
                'app/entities/entity.js',
                // home
                'app/home/home.js',
                'app/home/home.controller.js',
                // layouts
                'app/layouts/error/error.js',
                'app/layouts/navbar/navbar.directive.js',
                'app/layouts/navbar/navbar.controller.js',
                // services
                'app/services/auth/auth.service.js',
                'app/services/auth/principal.service.js',
                'app/services/auth/authority.directive.js',
                'app/services/auth/account.service.js',
                'app/services/auth/activate.service.js',
                'app/services/auth/password.service.js',
                'app/services/auth/register.service.js',
                'app/services/user/user.service.js'
            ];
            if (this.enableTranslation) {
                appScripts = appScripts.concat([
                    'bower_components/messageformat/locale/en.js',
                    'bower_components/messageformat/locale/fr.js',
                    'app/components/language/language.service.js',
                    'app/components/language/language.controller.js']);
            }
            if (this.enableSocialSignIn) {
                appScripts = appScripts.concat([
                    'app/account/social/directive/social.directive.js',
                    'app/account/social/social-register.js',
                    'app/account/social/social-register.controller.js',
                    'app/account/social/social.service.js']);
            }
            if (this.authenticationType == 'jwt') {
                appScripts = appScripts.concat([
                    'app/services/auth/auth.jwt.service.js']);
            }

            if (this.authenticationType == 'oauth2') {
                appScripts = appScripts.concat([
                    'app/services/auth/auth.oauth2.service.js']);
            }

            if (this.authenticationType == 'session') {
                appScripts = appScripts.concat([
                    'app/services/auth/sessions.service.js',
                    'app/services/auth/auth.session.service.js',
                    'app/account/sessions/sessions.js',
                    'app/account/sessions/sessions.controller.js']);
            }

            if (this.websocket == 'spring-websocket') {
                appScripts = appScripts.concat([
                    'app/admin/tracker/tracker.js',
                    'app/admin/tracker/tracker.controller.js',
                    'app/admin/tracker/tracker.service.js'])
            }

            indexFile = html.appendScripts(indexFile, 'app/app.js', appScripts, {});
            this.write(WEBAPP_DIR + 'index.html', indexFile);

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

        },

        writeClientTestFwFiles: function () {
            if(this.skipClient){
                return;
            }
            // Create Test Javascript files
            var testTemplates = [
                '_karma.conf.js',
                'spec/helpers/_module.js',
                'spec/helpers/_httpBackend.js',
                'spec/app/admin/health/_health.controller.spec.js',
                'spec/app/account/login/_login.controller.spec.js',
                'spec/app/account/password/_password.controller.spec.js',
                'spec/app/account/password/_password.directive.spec.js',
                'spec/app/account/settings/_settings.controller.spec.js',
                'spec/app/account/activate/_activate.controller.spec.js',
                'spec/app/account/register/_register.controller.spec.js',
                'spec/app/account/reset/finish/_reset.finish.controller.spec.js',
                'spec/app/account/reset/request/_reset.request.controller.spec.js',
                'spec/app/services/auth/_auth.services.spec.js'
            ];
            if (this.authenticationType == 'session') {
                testTemplates.push('spec/app/account/sessions/_sessions.controller.spec.js');
            }
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') != -1) {
                testTemplates.push('e2e/_account.js');
                testTemplates.push('e2e/_administration.js');
                testTemplates.push('_protractor.conf.js')
            }
            testTemplates.map(function(testTemplatePath) {
                this.template(TEST_JS_DIR + testTemplatePath, TEST_JS_DIR + testTemplatePath.replace(/_/,''), this, {});
            }.bind(this));

        },

        cleanup: function () {
            cleanup.cleanupOldFiles(this, this.javaDir, this.testDir, RESOURCE_DIR, WEBAPP_DIR, TEST_JS_DIR);
        },

        regenerateEntities: function () {
            if (this.withEntities) {
                this.getExistingEntities().forEach( function(entity) {
                    this.composeWith('jhipster:entity', {options: {regenerate: true}, args:[entity.name]});
                }, this);
            }
        }
    },

    install: function () {
        if(this.skipClient){
            return;
        }
        var injectDependenciesAndConstants = function () {
            if (this.options['skip-install']) {
                this.log(
                    'After running ' + chalk.yellow.bold('npm install & bower install') + ' ...' +
                    '\n' +
                    '\nInject your front end dependencies into your source code:' +
                    '\n ' + chalk.yellow.bold('gulp wiredep') +
                    '\n' +
                    '\nGenerate the Angular constants:' +
                    '\n ' + chalk.yellow.bold('gulp ngconstant:dev') +
                    (this.useSass ?
                    '\n' +
                    '\nCompile your Sass style sheets:' +
                    '\n ' + chalk.yellow.bold('gulp sass') : '') +
                    '\n' +
                    '\nOr do all of the above:' +
                    '\n ' + chalk.yellow.bold('gulp install') +
                    '\n'
                );
            } else {
                this.spawnCommand('gulp', ['install']);
            }
        };

        this.installDependencies({
            callback: injectDependenciesAndConstants.bind(this)
        });
    },

    end: function () {
        if (this.prodDatabaseType === 'oracle') {
            this.log(chalk.yellow.bold('\n\nYou have selected Oracle database.\n') + 'Please place the ' + chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' in the `' + chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
        }
    }

});

'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base'),
    packagejs = require(__dirname + '/../package.json'),
    crypto = require("crypto"),
    mkdirp = require('mkdirp'),
    html = require("html-wiring"),
    ejs = require('ejs');

var JhipsterGenerator = module.exports = function JhipsterGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        if (this.prodDatabaseType === 'oracle') {
            console.log(chalk.yellow.bold('\n\nYou have selected Oracle database.\n') + 'Please place the ' + chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' in the `' + chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
        }
    });

    this.pkg = JSON.parse(html.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JhipsterGenerator, yeoman.generators.Base);
util.inherits(JhipsterGenerator, scriptBase);

JhipsterGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    console.log(chalk.white(
        '       __   __    __   __  .______     _______.___________. _______ .______\n' +
        '      |  | |  |  |  | |  | |   _  \\   /       |           ||   ____||   _  \\\n' +
        '      |  | |  |__|  | |  | |  |_)  | |   (----`---|  |----`|  |__   |  |_)  |\n' +
        '.--.  |  | |   __   | |  | |   ___/   \\   \\       |  |     |   __|  |      /\n' +
        '|  `--\'  | |  |  |  | |  | |  |   .----)   |      |  |     |  |____ |  |\\  \\----.\n' +
        ' \\______/  |__|  |__| |__| | _|   |_______/       |__|     |_______|| _| `._____|\n'));
    console.log(chalk.white.bold('                            http://jhipster.github.io\n'));
    console.log(chalk.white('Welcome to the JHipster Generator ') + chalk.yellow('v' + packagejs.version + '\n'));
    var insight = this.insight();
    this.javaVersion = '8'; // Java version is forced to be 1.8. We keep the variable as it might be useful in the future.
    var questions = 15; // making questions a variable to avoid updating each question by hand when adding additional options
    var defaultAppBaseName = (/^[a-zA-Z0-9_]+$/.test(path.basename(process.cwd())))?path.basename(process.cwd()):'jhipster';

    var prompts = [
        {
            when: function () {
                return insight.optOut === undefined;
            },
            type: 'confirm',
            name: 'insight',
            message: 'May ' + chalk.cyan('JHipster') + ' anonymously report usage statistics to improve the tool over time?',
            default: true
        },
        {
            type: 'input',
            name: 'baseName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your application name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/' + questions + ') What is the base name of your application?',
            default: defaultAppBaseName
        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: '(2/' + questions + ') What is your default Java package name?',
            default: 'com.mycompany.myapp'
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: '(3/' + questions + ') Which *type* of authentication would you like to use?',
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
                    value: 'xauth',
                    name: 'Token-based authentication (stateless, with a token)'
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
            message: '(4/' + questions + ') Which *type* of database would you like to use?',
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
            message: '(4/' + questions + ') Which *type* of database would you like to use?',
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
            message: '(5/' + questions + ') Which *production* database would you like to use?',
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
            message: '(6/' + questions + ') Which *development* database would you like to use?',
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
            message: '(6/' + questions + ') Which *development* database would you like to use?',
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
            message: '(6/' + questions + ') Which *development* database would you like to use?',
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
            message: '(7/' + questions + ') Do you want to use Hibernate 2nd level cache?',
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
            message: '(8/' + questions + ') Do you want to use a search engine in your application?',
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
            message: '(9/' + questions + ') Do you want to use clustered HTTP sessions?',
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
            message: '(10/' + questions + ') Do you want to use WebSockets?',
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
            message: '(11/' + questions + ') Would you like to use Maven or Gradle for building the backend?',
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
        },
        {
            type: 'list',
            name: 'frontendBuilder',
            choices: [
                {
                    value: 'grunt',
                    name: 'Grunt (recommended)'
                },
                {
                    value: 'gulp',
                    name: 'Gulp.js'
                }
            ],
            message: '(12/' + questions + ') Would you like to use Grunt or Gulp.js for building the frontend?',
            default: 'grunt'
        },
        {
            type: 'confirm',
            name: 'useSass',
            message: '(13/' + questions + ') Would you like to use the LibSass stylesheet preprocessor for your CSS?',
            default: false
        },
        {
            type: 'confirm',
            name: 'enableTranslation',
            message: '(14/' + questions + ') Would you like to enable translation support with Angular Translate?',
            default: true
        },
        {
          type: 'checkbox',
          name: 'testFrameworks',
          message: '(15/' + questions + ') Which testing frameworks would you like to use?',
          choices: [
                    {name: 'Gatling', value: 'gatling'},
                    {name: 'Cucumber', value: 'cucumber'},
                    {name: 'Protractor', value: 'protractor'}
          ],
          default: [ 'gatling' ]
        }
    ];

    this.baseName = this.config.get('baseName');
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
    } else { // sql
        this.devDatabaseType = this.config.get('devDatabaseType');
        this.prodDatabaseType = this.config.get('prodDatabaseType');
        this.hibernateCache = this.config.get('hibernateCache');
    }
    this.useSass = this.config.get('useSass');
    if (this.useSass == undefined) { // backward compatibility for existing compass users
        this.useSass = this.config.get('useCompass');
    }
    this.buildTool = this.config.get('buildTool');
    this.frontendBuilder = this.config.get('frontendBuilder');
    this.rememberMeKey = this.config.get('rememberMeKey');
    this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
    this.testFrameworks = this.config.get('testFrameworks');
    this.enableSocialSignIn = this.config.get('enableSocialSignIn');
    this.packagejs = packagejs;

    if (this.baseName != null &&
        this.packageName != null &&
        this.authenticationType != null &&
        this.hibernateCache != null &&
        this.clusteredHttpSession != null &&
        this.websocket != null &&
        this.databaseType != null &&
        this.devDatabaseType != null &&
        this.prodDatabaseType != null &&
        this.searchEngine != null &&
        this.useSass != null &&
        this.buildTool != null &&
        this.frontendBuilder != null) {

        // Generate key if key does not already exist in config
        if (this.rememberMeKey == null) {
            this.rememberMeKey = crypto.randomBytes(20).toString('hex');
        }

        // If translation is not defined, it is enabled by default
        if (this.enableTranslation == null) {
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

        console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
            'to re-generate the project...\n'));

        cb();
    } else {
        this.prompt(prompts, function (props) {
            if (props.insight !== undefined) {
                insight.optOut = !props.insight;
            }
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

            this.baseName = props.baseName;
            this.packageName = props.packageName;
            this.hibernateCache = props.hibernateCache;
            this.clusteredHttpSession = props.clusteredHttpSession;
            this.websocket = props.websocket;
            this.databaseType = props.databaseType;
            this.devDatabaseType = props.devDatabaseType;
            this.prodDatabaseType = props.prodDatabaseType;
            this.searchEngine = props.searchEngine;
            this.useSass = props.useSass;
            this.buildTool = props.buildTool;
            this.frontendBuilder = props.frontendBuilder;
            this.enableTranslation = props.enableTranslation;
            this.enableSocialSignIn = props.enableSocialSignIn;
            this.testFrameworks = props.testFrameworks;
            this.rememberMeKey = crypto.randomBytes(20).toString('hex');

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

            cb();
        }.bind(this));
    }
};

JhipsterGenerator.prototype.app = function app() {
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
    insight.track('app/useSass', this.useSass);
    insight.track('app/buildTool', this.buildTool);
    insight.track('app/frontendBuilder', this.frontendBuilder);
    insight.track('app/enableTranslation', this.enableTranslation);
    insight.track('app/enableSocialSignIn', this.enableSocialSignIn);
    insight.track('app/testFrameworks', this.testFrameworks);

    var packageFolder = this.packageName.replace(/\./g, '/');
    var javaDir = 'src/main/java/' + packageFolder + '/';
    var resourceDir = 'src/main/resources/';
    var webappDir = 'src/main/webapp/';
    var interpolateRegex = /<%=([\s\S]+?)%>/g; // so that tags in templates do not get mistreated as _ templates

    // Remove old files

    // Application name modified, using each technology's conventions
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
    this.camelizedBaseName = _.camelize(this.baseName);
    this.slugifiedBaseName = _.slugify(this.baseName);
    this.lowercaseBaseName = this.baseName.toLowerCase();

    if (this.prodDatabaseType === 'oracle') { // create a folder for users to place ojdbc jar
        this.ojdbcVersion = '7';
        this.libFolder = 'lib/oracle/ojdbc/' + this.ojdbcVersion + '/';
        mkdirp(this.libFolder);
    }

    if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
        this.pkType = 'String';
    } else {
        this.pkType = 'Long';
    }

    // Create application
    this.template('_package.json', 'package.json', this, {});
    this.template('_bower.json', 'bower.json', this, {});
    this.template('_README.md', 'README.md', this, {});
    this.template('bowerrc', '.bowerrc', this, {});
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

    // Create docker-compose file
    if (this.devDatabaseType != "h2Disk" && this.devDatabaseType != "h2Memory" && this.devDatabaseType != "oracle") {
        this.template('_docker-compose.yml', 'docker-compose.yml', this, {});
    }
    if (this.prodDatabaseType != "oracle" || this.searchEngine == "elasticsearch") {
        this.template('_docker-compose-prod.yml', 'docker-compose-prod.yml', this, {});
    }
    if (this.devDatabaseType == "cassandra") {
        this.template('_Dockerfile_cassandra', 'Dockerfile', this, {});
        this.template('docker/cassandra/_cassandra.sh', 'docker/cassandra/cassandra.sh', this, {});
        this.template('docker/opscenter/_Dockerfile', 'docker/opscenter/Dockerfile', this, {});
    }

    switch (this.frontendBuilder) {
        case 'gulp':
            this.template('gulpfile.js', 'gulpfile.js', this, {});
            break;
        case 'grunt':
        default:
            this.template('Gruntfile.js', 'Gruntfile.js', this, {});
    }

    switch (this.buildTool) {
        case 'gradle':
            this.template('_build.gradle', 'build.gradle', this, {});
            this.template('_settings.gradle', 'settings.gradle', this, {});
            this.template('_gradle.properties', 'gradle.properties', this, {});
            this.template('_yeoman.gradle', 'yeoman.gradle', this, {});
            this.template('_sonar.gradle', 'sonar.gradle', this, {});
            this.template('_profile_dev.gradle', 'profile_dev.gradle', this, {'interpolate': interpolateRegex});
            this.template('_profile_prod.gradle', 'profile_prod.gradle', this, {'interpolate': interpolateRegex});
            this.template('_profile_fast.gradle', 'profile_fast.gradle', this, {'interpolate': interpolateRegex});
            this.template('_mapstruct.gradle', 'mapstruct.gradle', this, {'interpolate': interpolateRegex});
            if (this.testFrameworks.indexOf('gatling') != -1) {
                this.template('_gatling.gradle', 'gatling.gradle', this, {});
            }
            if (this.databaseType == "sql") {
                this.template('_liquibase.gradle', 'liquibase.gradle', this, {});
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
            this.template('_pom.xml', 'pom.xml', null, {'interpolate': interpolateRegex});
    }

    // Create Java resource files
    mkdirp(resourceDir);
    this.copy(resourceDir + '/banner.txt', resourceDir + '/banner.txt');

    if (this.hibernateCache == "ehcache") {
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml', this, {});
    }
    if (this.devDatabaseType == "h2Disk" || this.devDatabaseType == "h2Memory") {
        this.copy(resourceDir + 'h2.server.properties', resourceDir + '.h2.server.properties');
    }

    // Thymeleaf templates
    this.copy(resourceDir + '/templates/error.html', resourceDir + 'templates/error.html');

    this.template(resourceDir + '_logback-spring.xml', resourceDir + 'logback-spring.xml', this, {'interpolate': interpolateRegex});

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml', this, {});
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml', this, {});
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml', this, {});

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_initial_schema.xml', resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {'interpolate': interpolateRegex});
        this.copy(resourceDir + '/config/liquibase/master.xml', resourceDir + 'config/liquibase/master.xml');
        this.copy(resourceDir + '/config/liquibase/users.csv', resourceDir + 'config/liquibase/users.csv');
        this.copy(resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
        this.copy(resourceDir + '/config/liquibase/users_authorities.csv', resourceDir + 'config/liquibase/users_authorities.csv');
    }

    if (this.databaseType == "mongodb") {
        this.copy(resourceDir + '/config/mongeez/authorities.xml', resourceDir + 'config/mongeez/authorities.xml');
        this.copy(resourceDir + '/config/mongeez/master.xml', resourceDir + 'config/mongeez/master.xml');
        this.copy(resourceDir + '/config/mongeez/users.xml', resourceDir + 'config/mongeez/users.xml');
        this.copy(resourceDir + '/config/mongeez/social_user_connections.xml', resourceDir + 'config/mongeez/social_user_connections.xml');
    }

    if (this.databaseType == "cassandra") {
        this.template(resourceDir + '/config/cql/_create-keyspace-prod.cql', resourceDir + 'config/cql/create-keyspace-prod.cql', this, {});
        this.template(resourceDir + '/config/cql/_create-keyspace.cql', resourceDir + 'config/cql/create-keyspace.cql', this, {});
        this.template(resourceDir + '/config/cql/_drop-keyspace.cql', resourceDir + 'config/cql/drop-keyspace.cql', this, {});
        this.copy(resourceDir + '/config/cql/create-tables.cql', resourceDir + 'config/cql/create-tables.cql');
    }

    // Create mail templates
    this.copy(resourceDir + '/mails/activationEmail.html', resourceDir + 'mails/activationEmail.html');
    this.copy(resourceDir + '/mails/creationEmail.html', resourceDir + 'mails/creationEmail.html');
    this.copy(resourceDir + '/mails/passwordResetEmail.html', resourceDir + 'mails/passwordResetEmail.html');
    if (this.enableSocialSignIn) {
        this.copy(resourceDir + '/mails/socialRegistrationValidationEmail.html', resourceDir + 'mails/socialRegistrationValidationEmail.html');
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

    if (this.authenticationType == 'xauth') {
        this.template('src/main/java/package/config/_XAuthConfiguration.java', javaDir + 'config/XAuthConfiguration.java', this, {});
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
    if (this.authenticationType == 'xauth') {
        this.template('src/main/java/package/security/_AuthenticationProvider.java', javaDir + 'security/AuthenticationProvider.java', this, {});
    }
    this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});
    if (this.authenticationType == 'session') {
        this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
    }
    this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
    this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
    if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
        this.template('src/main/java/package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
    }
    this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
    this.template('src/main/java/package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});

    if (this.authenticationType == 'xauth') {
        this.template('src/main/java/package/security/xauth/_Token.java', javaDir + 'security/xauth/Token.java', this, {});
        this.template('src/main/java/package/security/xauth/_TokenProvider.java', javaDir + 'security/xauth/TokenProvider.java', this, {});
        this.template('src/main/java/package/web/rest/_UserXAuthTokenController.java', javaDir + 'web/rest/UserXAuthTokenController.java', this, {});
        this.template('src/main/java/package/security/xauth/_XAuthTokenConfigurer.java', javaDir + 'security/xauth/XAuthTokenConfigurer.java', this, {});
        this.template('src/main/java/package/security/xauth/_XAuthTokenFilter.java', javaDir + 'security/xauth/XAuthTokenFilter.java', this, {});
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

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    var testResourceDir = 'src/test/resources/';
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

    this.template(testResourceDir + 'config/_application.yml', testResourceDir + 'config/application.yml', this, {});
    this.template(testResourceDir + '_logback-test.xml', testResourceDir + 'logback-test.xml', this, {});

    if (this.hibernateCache == "ehcache") {
        this.template(testResourceDir + '_ehcache.xml', testResourceDir + 'ehcache.xml', this, {});
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

    // Create Webapp
    mkdirp(webappDir);

    // normal CSS or SCSS?
    if (this.useSass) {
        this.template('src/main/scss/main.scss', 'src/main/scss/main.scss');
    }
    // this css file will be overwritten by the sass generated css if sass is enabled
    // but this will avoid errors when running app without running sass task first
    this.template('src/main/webapp/assets/styles/main.css', 'src/main/webapp/assets/styles/main.css');

    // HTML5 BoilerPlate
    this.copy(webappDir + 'favicon.ico', webappDir + 'favicon.ico');
    this.copy(webappDir + 'robots.txt', webappDir + 'robots.txt');
    this.copy(webappDir + 'htaccess.txt', webappDir + '.htaccess');
    this.copy(webappDir + '404.html', webappDir + '404.html');

    // install all files related to i18n if translation is enabled
    if (this.enableTranslation) {
        this.installI18nFilesByLanguage(this, webappDir, resourceDir, 'en');
        this.installI18nFilesByLanguage(this, webappDir, resourceDir, 'fr');
    } else {
        this.template(resourceDir + '/i18n/_messages_en.properties', resourceDir + 'i18n/messages_en.properties', this, {});
    }

    // Swagger-ui for Jhipster
    this.template(webappDir + '/swagger-ui/_index.html', webappDir + 'swagger-ui/index.html', this, {});
    this.copy(webappDir + '/swagger-ui/images/throbber.gif', webappDir + 'swagger-ui/images/throbber.gif');

    // Angular JS views

    this.template(webappDir + '/scripts/app/_app.js', webappDir + 'scripts/app/app.js', this, {});
    // Client Components
    this.template(webappDir + '/scripts/components/admin/_audits.service.js', webappDir + 'scripts/components/admin/audits.service.js', this, {});
    this.template(webappDir + '/scripts/components/admin/_configuration.service.js', webappDir + 'scripts/components/admin/configuration.service.js', this, {});
    this.template(webappDir + '/scripts/components/admin/_logs.service.js', webappDir + 'scripts/components/admin/logs.service.js', this, {});
    this.template(webappDir + '/scripts/components/admin/_monitoring.service.js', webappDir + 'scripts/components/admin/monitoring.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/_auth.service.js', webappDir + 'scripts/components/auth/auth.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/_principal.service.js', webappDir + 'scripts/components/auth/principal.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/_authority.directive.js', webappDir + 'scripts/components/auth/authority.directive.js', this, {});
    if (this.authenticationType == 'oauth2') {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.oauth2.service.js', webappDir + 'scripts/components/auth/provider/auth.oauth2.service.js', this, {});
    } else if (this.authenticationType == 'xauth') {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.xauth.service.js', webappDir + 'scripts/components/auth/provider/auth.xauth.service.js', this, {});
    } else {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.session.service.js', webappDir + 'scripts/components/auth/provider/auth.session.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/auth/services/_account.service.js', webappDir + 'scripts/components/auth/services/account.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_activate.service.js', webappDir + 'scripts/components/auth/services/activate.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_password.service.js', webappDir + 'scripts/components/auth/services/password.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_register.service.js', webappDir + 'scripts/components/auth/services/register.service.js', this, {});
    if (this.authenticationType == 'session') {
        this.template(webappDir + '/scripts/components/auth/services/_sessions.service.js', webappDir + 'scripts/components/auth/services/sessions.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/form/_form.directive.js', webappDir + 'scripts/components/form/form.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_maxbytes.directive.js', webappDir + 'scripts/components/form/maxbytes.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_minbytes.directive.js', webappDir + 'scripts/components/form/minbytes.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_uib-pager.config.js', webappDir + 'scripts/components/form/uib-pager.config.js', this, {});
    this.template(webappDir + '/scripts/components/form/_uib-pagination.config.js', webappDir + 'scripts/components/form/uib-pagination.config.js', this, {});
    if (this.enableTranslation) {
        this.template(webappDir + '/scripts/components/language/_language.controller.js', webappDir + 'scripts/components/language/language.controller.js', this, {});
        this.template(webappDir + '/scripts/components/language/_language.service.js', webappDir + 'scripts/components/language/language.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/navbar/_navbar.directive.js', webappDir + 'scripts/components/navbar/navbar.directive.js', this, {});
    this.copyHtml(webappDir + '/scripts/components/navbar/navbar.html', webappDir + 'scripts/components/navbar/navbar.html');
    this.template(webappDir + '/scripts/components/navbar/_navbar.controller.js', webappDir + 'scripts/components/navbar/navbar.controller.js', this, {});
    this.template(webappDir + '/scripts/components/user/_user.service.js', webappDir + 'scripts/components/user/user.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_base64.service.js', webappDir + 'scripts/components/util/base64.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_capitalize.filter.js', webappDir + 'scripts/components/util/capitalize.filter.js', this, {});
    this.template(webappDir + '/scripts/components/util/_parse-links.service.js', webappDir + 'scripts/components/util/parse-links.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_truncate.filter.js', webappDir + 'scripts/components/util/truncate.filter.js', this, {});
    this.template(webappDir + '/scripts/components/util/_dateutil.service.js', webappDir + 'scripts/components/util/dateutil.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_data-util.service.js', webappDir + 'scripts/components/util/data-util.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_sort.directive.js', webappDir + 'scripts/components/util/sort.directive.js', this, {});

    // Client App
    this.template(webappDir + '/scripts/app/account/_account.js', webappDir + 'scripts/app/account/account.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/activate/activate.html', webappDir + 'scripts/app/account/activate/activate.html');
    this.copyJs(webappDir + '/scripts/app/account/activate/_activate.js', webappDir + 'scripts/app/account/activate/activate.js', this, {});
    this.template(webappDir + '/scripts/app/account/activate/_activate.controller.js', webappDir + 'scripts/app/account/activate/activate.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/login/login.html', webappDir + 'scripts/app/account/login/login.html');
    this.copyJs(webappDir + '/scripts/app/account/login/_login.js', webappDir + 'scripts/app/account/login/login.js', this, {});
    this.template(webappDir + '/scripts/app/account/login/_login.controller.js', webappDir + 'scripts/app/account/login/login.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/password/password.html', webappDir + 'scripts/app/account/password/password.html');
    this.copyJs(webappDir + '/scripts/app/account/password/_password.js', webappDir + 'scripts/app/account/password/password.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.controller.js', webappDir + 'scripts/app/account/password/password.controller.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.directive.js', webappDir + 'scripts/app/account/password/password.directive.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/register/register.html', webappDir + 'scripts/app/account/register/register.html');
    this.copyJs(webappDir + '/scripts/app/account/register/_register.js', webappDir + 'scripts/app/account/register/register.js', this, {});
    this.template(webappDir + '/scripts/app/account/register/_register.controller.js', webappDir + 'scripts/app/account/register/register.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/reset/request/reset.request.html', webappDir + 'scripts/app/account/reset/request/reset.request.html');
    this.copyJs(webappDir + '/scripts/app/account/reset/request/_reset.request.js', webappDir + 'scripts/app/account/reset/request/reset.request.js', this, {});
    this.template(webappDir + '/scripts/app/account/reset/request/_reset.request.controller.js', webappDir + 'scripts/app/account/reset/request/reset.request.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/reset/finish/reset.finish.html', webappDir + 'scripts/app/account/reset/finish/reset.finish.html');
    this.copyJs(webappDir + '/scripts/app/account/reset/finish/_reset.finish.js', webappDir + 'scripts/app/account/reset/finish/reset.finish.js', this, {});
    this.template(webappDir + '/scripts/app/account/reset/finish/_reset.finish.controller.js', webappDir + 'scripts/app/account/reset/finish/reset.finish.controller.js', this, {});
    if (this.authenticationType == 'session') {
        this.copyHtml(webappDir + '/scripts/app/account/sessions/sessions.html', webappDir + 'scripts/app/account/sessions/sessions.html');
        this.copyJs(webappDir + '/scripts/app/account/sessions/_sessions.js', webappDir + 'scripts/app/account/sessions/sessions.js', this, {});
        this.template(webappDir + '/scripts/app/account/sessions/_sessions.controller.js', webappDir + 'scripts/app/account/sessions/sessions.controller.js', this, {});
    }
    this.copyHtml(webappDir + '/scripts/app/account/settings/settings.html', webappDir + 'scripts/app/account/settings/settings.html');
    this.copyJs(webappDir + '/scripts/app/account/settings/_settings.js', webappDir + 'scripts/app/account/settings/settings.js', this, {});
    this.template(webappDir + '/scripts/app/account/settings/_settings.controller.js', webappDir + 'scripts/app/account/settings/settings.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/_admin.js', webappDir + 'scripts/app/admin/admin.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/admin/audits/audits.html', webappDir + 'scripts/app/admin/audits/audits.html');
    this.copyJs(webappDir + '/scripts/app/admin/audits/_audits.js', webappDir + 'scripts/app/admin/audits/audits.js', this, {});
    this.template(webappDir + '/scripts/app/admin/audits/_audits.controller.js', webappDir + 'scripts/app/admin/audits/audits.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/admin/configuration/configuration.html', webappDir + 'scripts/app/admin/configuration/configuration.html');
    this.copyJs(webappDir + '/scripts/app/admin/configuration/_configuration.js', webappDir + 'scripts/app/admin/configuration/configuration.js', this, {});
    this.template(webappDir + '/scripts/app/admin/configuration/_configuration.controller.js', webappDir + 'scripts/app/admin/configuration/configuration.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/docs/docs.html', webappDir + 'scripts/app/admin/docs/docs.html');
    this.copyJs(webappDir + '/scripts/app/admin/docs/_docs.js', webappDir + 'scripts/app/admin/docs/docs.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/admin/health/health.html', webappDir + 'scripts/app/admin/health/health.html');
    this.copyHtml(webappDir + '/scripts/app/admin/health/_health.modal.html', webappDir + 'scripts/app/admin/health/health.modal.html');
    this.copyJs(webappDir + '/scripts/app/admin/health/_health.js', webappDir + 'scripts/app/admin/health/health.js', this, {});
    this.template(webappDir + '/scripts/app/admin/health/_health.controller.js', webappDir + 'scripts/app/admin/health/health.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/health/_health.modal.controller.js', webappDir + 'scripts/app/admin/health/health.modal.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/admin/logs/logs.html', webappDir + 'scripts/app/admin/logs/logs.html');
    this.copyJs(webappDir + '/scripts/app/admin/logs/_logs.js', webappDir + 'scripts/app/admin/logs/logs.js', this, {});
    this.template(webappDir + '/scripts/app/admin/logs/_logs.controller.js', webappDir + 'scripts/app/admin/logs/logs.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/admin/metrics/_metrics.html', webappDir + 'scripts/app/admin/metrics/metrics.html', this, {}, true);
    this.copyHtml(webappDir + '/scripts/app/admin/metrics/_metrics.modal.html', webappDir + 'scripts/app/admin/metrics/metrics.modal.html', this, {}, true);
    this.copyJs(webappDir + '/scripts/app/admin/metrics/_metrics.js', webappDir + 'scripts/app/admin/metrics/metrics.js', this, {});
    this.template(webappDir + '/scripts/app/admin/metrics/_metrics.controller.js', webappDir + 'scripts/app/admin/metrics/metrics.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/metrics/_metrics.modal.controller.js', webappDir + 'scripts/app/admin/metrics/metrics.modal.controller.js', this, {});
    if (this.websocket == 'spring-websocket') {
        this.copyHtml(webappDir + '/scripts/app/admin/tracker/tracker.html', webappDir + 'scripts/app/admin/tracker/tracker.html');
        this.copyJs(webappDir + '/scripts/app/admin/tracker/_tracker.js', webappDir + 'scripts/app/admin/tracker/tracker.js', this, {});
        this.template(webappDir + '/scripts/app/admin/tracker/_tracker.controller.js', webappDir + 'scripts/app/admin/tracker/tracker.controller.js', this, {});
        this.template(webappDir + '/scripts/components/tracker/_tracker.service.js', webappDir + '/scripts/components/tracker/tracker.service.js', this, {});
    }
    this.copyHtml(webappDir + '/scripts/app/admin/user-management/user-management.html', webappDir + 'scripts/app/admin/user-management/user-management.html');
    this.copyHtml(webappDir + '/scripts/app/admin/user-management/_user-management-detail.html', webappDir + 'scripts/app/admin/user-management/user-management-detail.html');
    this.copyHtml(webappDir + '/scripts/app/admin/user-management/_user-management-dialog.html', webappDir + 'scripts/app/admin/user-management/user-management-dialog.html');
    this.copyHtml(webappDir + '/scripts/app/admin/user-management/_user-management-delete-dialog.html', webappDir + 'scripts/app/admin/user-management/user-management-delete-dialog.html');
    this.copyJs(webappDir + '/scripts/app/admin/user-management/_user-management.js', webappDir + 'scripts/app/admin/user-management/user-management.js', this, {});
    this.template(webappDir + '/scripts/app/admin/user-management/_user-management.controller.js', webappDir + 'scripts/app/admin/user-management/user-management.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/user-management/_user-management-detail.controller.js', webappDir + 'scripts/app/admin/user-management/user-management-detail.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/user-management/_user-management-dialog.controller.js', webappDir + 'scripts/app/admin/user-management/user-management-dialog.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/user-management/_user-management-delete-dialog.controller.js', webappDir + 'scripts/app/admin/user-management/user-management-delete-dialog.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/error/error.html', webappDir + 'scripts/app/error/error.html');
    this.copyHtml(webappDir + '/scripts/app/error/accessdenied.html', webappDir + 'scripts/app/error/accessdenied.html');
    this.copyJs(webappDir + '/scripts/app/entities/_entity.js', webappDir + 'scripts/app/entities/entity.js', this, {});
    this.copyJs(webappDir + '/scripts/app/error/_error.js', webappDir + 'scripts/app/error/error.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/main/main.html', webappDir + 'scripts/app/main/main.html');
    this.copyJs(webappDir + '/scripts/app/main/_main.js', webappDir + 'scripts/app/main/main.js', this, {});
    this.template(webappDir + '/scripts/app/main/_main.controller.js', webappDir + 'scripts/app/main/main.controller.js', this, {});

    // Social
    if (this.enableSocialSignIn) {
        this.copyHtml(webappDir + '/scripts/app/account/social/directive/_social.html', webappDir + 'scripts/app/account/social/directive/social.html');
        this.template(webappDir + '/scripts/app/account/social/directive/_social.directive.js', webappDir + 'scripts/app/account/social/directive/social.directive.js', this, {});
        this.copyHtml(webappDir + '/scripts/app/account/social/_social-register.html', webappDir + 'scripts/app/account/social/social-register.html');
        this.template(webappDir + '/scripts/app/account/social/_social-register.controller.js', webappDir + 'scripts/app/account/social/social-register.controller.js', this, {});
        this.template(webappDir + '/scripts/app/account/social/_social.service.js', webappDir + 'scripts/app/account/social/social.service.js', this, {});
        this.copyJs(webappDir + '/scripts/app/account/social/_social-register.js', webappDir + 'scripts/app/account/social/social-register.js', this, {});
    }

    // interceptor code
    this.template(webappDir + '/scripts/components/interceptor/_auth.interceptor.js', webappDir + 'scripts/components/interceptor/auth.interceptor.js', this, {});
    this.template(webappDir + '/scripts/components/interceptor/_errorhandler.interceptor.js', webappDir + 'scripts/components/interceptor/errorhandler.interceptor.js', this, {});
    this.template(webappDir + '/scripts/components/interceptor/_notification.interceptor.js', webappDir + 'scripts/components/interceptor/notification.interceptor.js', this, {});

    //alert service code
    this.template(webappDir + '/scripts/components/alert/_alert.service.js', webappDir + 'scripts/components/alert/alert.service.js', this, {});
    this.template(webappDir + '/scripts/components/alert/_alert.directive.js', webappDir + 'scripts/components/alert/alert.directive.js', this, {});

    // Index page
    this.indexFile = html.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.engine = require('ejs').render;
    this.indexFile = this.engine(this.indexFile, this, {});

    // Create Test Javascript files
    var testJsDir = 'src/test/javascript/';
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
        'spec/components/auth/_auth.services.spec.js'
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
        this.template(testJsDir + testTemplatePath, testJsDir + testTemplatePath.replace(/_/,''), this, {});
    }.bind(this));

    // CSS
    this.copy(webappDir + 'assets/styles/documentation.css', webappDir + 'assets/styles/documentation.css');

    // Images
    this.copy(webappDir + 'assets/images/development_ribbon.png', webappDir + 'assets/images/development_ribbon.png');
    this.copy(webappDir + 'assets/images/hipster.png', webappDir + 'assets/images/hipster.png');
    this.copy(webappDir + 'assets/images/hipster2x.png', webappDir + 'assets/images/hipster2x.png');

    var appScripts = [
        'scripts/app/app.js',
        'scripts/app/app.constants.js',
        'scripts/components/auth/auth.service.js',
        'scripts/components/auth/principal.service.js',
        'scripts/components/auth/authority.directive.js',
        'scripts/components/auth/services/account.service.js',
        'scripts/components/auth/services/activate.service.js',
        'scripts/components/auth/services/password.service.js',
        'scripts/components/auth/services/register.service.js',
        'scripts/components/form/form.directive.js',
        'scripts/components/form/maxbytes.directive.js',
        'scripts/components/form/minbytes.directive.js',
        'scripts/components/form/uib-pager.config.js',
        'scripts/components/form/uib-pagination.config.js',
        'scripts/components/admin/audits.service.js',
        'scripts/components/admin/logs.service.js',
        'scripts/components/admin/configuration.service.js',
        'scripts/components/admin/monitoring.service.js',
        'scripts/components/interceptor/auth.interceptor.js',
        'scripts/components/interceptor/errorhandler.interceptor.js',
        'scripts/components/interceptor/notification.interceptor.js',
        'scripts/components/navbar/navbar.directive.js',
        'scripts/components/navbar/navbar.controller.js',
        'scripts/components/user/user.service.js',
        'scripts/components/util/truncate.filter.js',
        'scripts/components/util/base64.service.js',
        'scripts/components/util/capitalize.filter.js',
        'scripts/components/alert/alert.service.js',
        'scripts/components/alert/alert.directive.js',
        'scripts/components/util/parse-links.service.js',
        'scripts/components/util/dateutil.service.js',
        'scripts/components/util/data-util.service.js',
        'scripts/components/util/sort.directive.js',
        'scripts/app/account/account.js',
        'scripts/app/account/activate/activate.js',
        'scripts/app/account/activate/activate.controller.js',
        'scripts/app/account/login/login.js',
        'scripts/app/account/login/login.controller.js',
        'scripts/app/account/password/password.js',
        'scripts/app/account/password/password.controller.js',
        'scripts/app/account/password/password.directive.js',
        'scripts/app/account/register/register.js',
        'scripts/app/account/register/register.controller.js',
        'scripts/app/account/settings/settings.js',
        'scripts/app/account/settings/settings.controller.js',
        'scripts/app/account/reset/finish/reset.finish.controller.js',
        'scripts/app/account/reset/finish/reset.finish.js',
        'scripts/app/account/reset/request/reset.request.controller.js',
        'scripts/app/account/reset/request/reset.request.js',
        'scripts/app/admin/admin.js',
        'scripts/app/admin/audits/audits.js',
        'scripts/app/admin/audits/audits.controller.js',
        'scripts/app/admin/configuration/configuration.js',
        'scripts/app/admin/configuration/configuration.controller.js',
        'scripts/app/admin/docs/docs.js',
        'scripts/app/admin/health/health.js',
        'scripts/app/admin/health/health.controller.js',
        'scripts/app/admin/health/health.modal.controller.js',
        'scripts/app/admin/logs/logs.js',
        'scripts/app/admin/logs/logs.controller.js',
        'scripts/app/admin/metrics/metrics.js',
        'scripts/app/admin/metrics/metrics.controller.js',
        'scripts/app/admin/metrics/metrics.modal.controller.js',
        'scripts/app/admin/user-management/user-management-detail.controller.js',
        'scripts/app/admin/user-management/user-management-dialog.controller.js',
        'scripts/app/admin/user-management/user-management-delete-dialog.controller.js',
        'scripts/app/admin/user-management/user-management.controller.js',
        'scripts/app/admin/user-management/user-management.js',
        'scripts/app/entities/entity.js',
        'scripts/app/error/error.js',
        'scripts/app/main/main.js',
        'scripts/app/main/main.controller.js'
    ];
    if (this.enableTranslation) {
        appScripts = appScripts.concat([
            'bower_components/messageformat/locale/en.js',
            'bower_components/messageformat/locale/fr.js',
            'scripts/components/language/language.service.js',
            'scripts/components/language/language.controller.js']);
    }
    if (this.enableSocialSignIn) {
        appScripts = appScripts.concat([
            'scripts/app/account/social/directive/social.directive.js',
            'scripts/app/account/social/social-register.js',
            'scripts/app/account/social/social-register.controller.js',
            'scripts/app/account/social/social.service.js']);
    }
    if (this.authenticationType == 'xauth') {
        appScripts = appScripts.concat([
            'scripts/components/auth/provider/auth.xauth.service.js']);
    }

    if (this.authenticationType == 'oauth2') {
        appScripts = appScripts.concat([
            'scripts/components/auth/provider/auth.oauth2.service.js']);
    }

    if (this.authenticationType == 'session') {
        appScripts = appScripts.concat([
            'scripts/components/auth/services/sessions.service.js',
            'scripts/components/auth/provider/auth.session.service.js',
            'scripts/app/account/sessions/sessions.js',
            'scripts/app/account/sessions/sessions.controller.js']);
    }

    if (this.websocket == 'spring-websocket') {
        appScripts = appScripts.concat([
            'scripts/app/admin/tracker/tracker.js',
            'scripts/app/admin/tracker/tracker.controller.js',
            'scripts/components/tracker/tracker.service.js'])
    }

    this.indexFile = html.appendScripts(this.indexFile, 'scripts/app.js', appScripts, {}, ['.tmp', 'src/main/webapp']);
    this.write(webappDir + 'index.html', this.indexFile);

    // Remove old files, from previous JHipster versions
    removefile(javaDir + 'config/MailConfiguration.java');
    removefile(javaDir + 'config/metrics/JavaMailHealthIndicator.java');
    if (this.databaseType == 'sql' || this.databaseType == 'mongodb') {
        removefolder(javaDir + 'config/metrics');
    }

    removefile(javaDir + 'security/_CustomUserDetails.java');
    removefile(javaDir + 'domain/util/CustomLocalDateSerializer.java');
    removefile(javaDir + 'domain/util/CustomDateTimeSerializer.java');
    removefile(javaDir + 'domain/util/CustomDateTimeDeserializer.java');
    removefile(javaDir + 'domain/util/CustomLocalDateDeserializer.java');
    removefile(javaDir + 'domain/util/DateToZonedDateTimeConverter.java');
    removefile(javaDir + 'domain/util/ZonedDateTimeToDateConverter.java');
    removefile(javaDir + 'domain/util/DateToLocalDateConverter.java');
    removefile(javaDir + 'domain/util/LocalDateToDateConverter.java');
    removefile(javaDir + 'domain/util/ISO8601LocalDateDeserializer.java');
    removefolder(javaDir + 'web/propertyeditors');

    removefile(resourceDir + 'logback.xml');

    removefile(webappDir + 'scripts/app/account/logout/logout.js');
    removefile(webappDir + 'scripts/app/account/logout/logout.controller.js');
    removefolder(webappDir + 'scripts/app/account/logout');

    removefile(testDir + 'config/MongoConfiguration.java');
    removefile(testJsDir + 'spec/app/account/health/healthControllerSpec.js');
    removefile(testJsDir + 'spec/app/account/login/loginControllerSpec.js');
    removefile(testJsDir + 'spec/app/account/password/passwordControllerSpec.js');
    removefile(testJsDir + 'spec/app/account/password/passwordDirectiveSpec.js');
    removefile(testJsDir + 'spec/app/account/sessions/sessionsControllerSpec.js');
    removefile(testJsDir + 'spec/app/account/settings/settingsControllerSpec.js');
    removefile(testJsDir + 'spec/components/auth/authServicesSpec.js');

    this.config.set('baseName', this.baseName);
    this.config.set('packageName', this.packageName);
    this.config.set('packageFolder', packageFolder);
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
    this.config.set('frontendBuilder', this.frontendBuilder);
    this.config.set('enableTranslation', this.enableTranslation);
    this.config.set('enableSocialSignIn', this.enableSocialSignIn);
    this.config.set('rememberMeKey', this.rememberMeKey);
    this.config.set('testFrameworks', this.testFrameworks);
};

JhipsterGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.template('_travis.yml', '.travis.yml', this, {});
};

function removefile(file) {
    console.log('Remove the file - ' + file)
    if (shelljs.test('-f', file)) {
        shelljs.rm(file);
    }
}

function removefolder(folder) {
    console.log('Remove the folder - ' + folder)
    if (shelljs.test('-d', folder)) {
        shelljs.rm("-rf", folder);
    }
}

JhipsterGenerator.prototype.install = function install() {
    this.installDependencies({
        skipInstall: this.options['skip-install'],
        callback: this._injectDependenciesAndConstants.bind(this)
    });
};

JhipsterGenerator.prototype._injectDependenciesAndConstants = function _injectDependenciesAndConstants() {
    if (this.options['skip-install']) {
        this.log(
            'After running `npm install & bower install`, inject your front end dependencies' +
            '\ninto your source code by running:' +
            '\n' +
            '\n' + chalk.yellow.bold('grunt wiredep') +
            '\n' +
            '\n ...and generate the Angular constants with:' +
            '\n' + chalk.yellow.bold('grunt ngconstant:dev')
        );
    } else {
        switch (this.frontendBuilder) {
            case 'gulp':
                this.spawnCommand('gulp', ['ngconstant:dev', 'wiredep:test', 'wiredep:app']);
                break;
            case 'grunt':
            default:
                this.spawnCommand('grunt', ['ngconstant:dev', 'wiredep']);
        }
    }
};

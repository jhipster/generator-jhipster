'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base'),
    packagejs = require(__dirname + '/../package.json');

var JhipsterGenerator = module.exports = function JhipsterGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JhipsterGenerator, yeoman.generators.Base);
util.inherits(JhipsterGenerator, scriptBase);



JhipsterGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    console.log(chalk.red('\n' +
        ' _     _   ___   __  _____  ____  ___       __  _____   __    __    _    \n' +
        '| |_| | | | |_) ( (`  | |  | |_  | |_)     ( (`  | |   / /\\  / /`  | |_/ \n' +
        '|_| | |_| |_|   _)_)  |_|  |_|__ |_| \\     _)_)  |_|  /_/--\\ \\_\\_, |_| \\ \n' +
        '                             ____  ___   ___                             \n' +
        '                            | |_  / / \\ | |_)                            \n' +
        '                            |_|   \\_\\_/ |_| \\                            \n' +
        '              _    __    _       __        ___   ____  _      __        \n' +
        '             | |  / /\\  \\ \\  /  / /\\      | | \\ | |_  \\ \\  / ( (`       \n' +
        '           \\_|_| /_/--\\  \\_\\/  /_/--\\     |_|_/ |_|__  \\_\\/  _)_)       \n'));

    console.log('\nWelcome to the JHipster Generator\n');
    var insight = this.insight();

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
            message: '(1/13) What is the base name of your application?',
            default: 'jhipster'
        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: '(2/13) What is your default Java package name?',
            default: 'com.mycompany.myapp'
        },
        {
            type: 'list',
            name: 'javaVersion',
            message: '(3/13) Do you want to use Java 8?',
            choices: [
                {
                    value: '8',
                    name: 'Yes (use Java 8)'
                },
                {
                    value: '7',
                    name: 'No (use Java 7)'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: '(4/13) Which *type* of authentication would you like to use?',
            choices: [
                {
                    value: 'cookie',
                    name: 'Cookie-Based Authentication (Session)'
                },
                {
                    value: 'token',
                    name: 'Token-Based Authentication (Oauth2)'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'databaseType',
            message: '(5/13) Which *type* of database would you like to use?',
            choices: [
                {
                    value: 'sql',
                    name: 'SQL (H2, MySQL, PostgreSQL)'
                },
                {
                    value: 'mongodb',
                    name: 'NoSQL (MongoDB)'
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
            message: '(6/13) Which *production* database would you like to use?',
            choices: [
                {
                    value: 'mysql',
                    name: 'MySQL'
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
                return response.databaseType == 'mongodb';
            },
            type: 'list',
            name: 'prodDatabaseType',
            message: '(6/13) Which *production* database would you like to use?',
            choices: [
                {
                    value: 'mongodb',
                    name: 'MongoDB'
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
            message: '(7/13) Which *development* database would you like to use?',
            choices: [
                {
                    value: 'h2Memory',
                    name: 'H2 in-memory with Web console'
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
            message: '(7/13) Which *development* database would you like to use?',
            choices: [
                {
                    value: 'h2Memory',
                    name: 'H2 in-memory with Web console'
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
                return response.databaseType == 'mongodb';
            },
            type: 'list',
            name: 'devDatabaseType',
            message: '(7/13) Which *development* database would you like to use?',
            choices: [
                {
                    value: 'mongodb',
                    name: 'MongoDB'
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
            message: '(8/13) Do you want to use Hibernate 2nd level cache?',
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
                return response.databaseType == 'mongodb';
            },
            type: 'list',
            name: 'hibernateCache',
            message: '(8/13) Do you want to use Hibernate 2nd level cache?',
            choices: [
                {
                    value: 'no',
                    name: 'No (this not possible with the NoSQL option)'
                },
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'clusteredHttpSession',
            message: '(9/13) Do you want to use clustered HTTP sessions?',
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
            message: '(10/13) Do you want to use WebSockets?',
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
            message: '(11/13) Would you like to use Maven or Gradle for building the backend?',
            choices: [
                {
                    value: 'maven',
                    name: 'Maven (recommended)'
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
            message: '(12/13) Would you like to use Grunt or Gulp.js for building the frontend?',
            default: 'grunt'
        },
        {
            type: 'confirm',
            name: 'useCompass',
            message: '(13/13) Would you like to use the Compass CSS Authoring Framework?',
            default: false
        }
    ];

    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.authenticationType = this.config.get('authenticationType');
    this.hibernateCache = this.config.get('hibernateCache');
    this.clusteredHttpSession = this.config.get('clusteredHttpSession');
    this.websocket = this.config.get('websocket');
    this.databaseType = this.config.get('databaseType');
    this.devDatabaseType = this.config.get('devDatabaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.useCompass = this.config.get('useCompass');
    this.javaVersion = this.config.get('javaVersion');
    this.buildTool = this.config.get('buildTool');
    this.frontendBuilder = this.config.get('frontendBuilder');
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
        this.useCompass != null &&
        this.buildTool != null &&
        this.frontendBuilder != null &&
        this.javaVersion != null) {

        console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
            'to re-generate the project...\n'));

        cb();
    } else {
        this.prompt(prompts, function (props) {
            if (props.insight !== undefined) {
                insight.optOut = !props.insight;
            }
            this.baseName = props.baseName;
            this.packageName = props.packageName;
            this.authenticationType = props.authenticationType;
            this.hibernateCache = props.hibernateCache;
            this.clusteredHttpSession = props.clusteredHttpSession;
            this.websocket = props.websocket;
            this.databaseType = props.databaseType;
            this.devDatabaseType = props.devDatabaseType;
            this.prodDatabaseType = props.prodDatabaseType;
            this.useCompass = props.useCompass;
            this.buildTool = props.buildTool;
            this.frontendBuilder = props.frontendBuilder;
            this.javaVersion = props.javaVersion;

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
    insight.track('app/useCompass', this.useCompass);
    insight.track('app/buildTool', this.buildTool);
    insight.track('app/frontendBuilder', this.frontendBuilder);
    insight.track('app/javaVersion', this.javaVersion);

    var packageFolder = this.packageName.replace(/\./g, '/');
    var javaDir = 'src/main/java/' + packageFolder + '/';
    var resourceDir = 'src/main/resources/';
    var webappDir = 'src/main/webapp/';

    // Remove old files

    // Angular JS app
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';

    // Create application
    this.template('_package.json', 'package.json', this, {});
    this.template('_bower.json', 'bower.json', this, {});
    this.template('_README.md', 'README.md', this, {});
    this.template('bowerrc', '.bowerrc', this, {});
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

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
            this.template('_gradle.properties', 'gradle.properties', this, {});
            this.template('_yeoman.gradle', 'yeoman.gradle', this, {});
            this.template('_profile_dev.gradle', 'profile_dev.gradle', this, {});
            this.template('_profile_prod.gradle', 'profile_prod.gradle', this, {});
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
            this.template('_pom.xml', 'pom.xml', null, { 'interpolate': /<%=([\s\S]+?)%>/g });
    }

    // Create Java resource files
    this.mkdir(resourceDir);
    this.copy(resourceDir + '/banner.txt', resourceDir + '/banner.txt');

    if (this.hibernateCache == "ehcache") {
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml', this, {});
    }
    if (this.devDatabaseType == "h2Memory") {
        this.copy(resourceDir + 'h2.server.properties', resourceDir + '.h2.server.properties');
    }

    // Thymeleaf templates
    this.copy(resourceDir + '/templates/error.html', resourceDir + 'templates/error.html');

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml', this, {});

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml', this, {});
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml', this, {});
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml', this, {});

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_initial_schema.xml', resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {});
        this.copy(resourceDir + '/config/liquibase/master.xml', resourceDir + 'config/liquibase/master.xml');
        this.copy(resourceDir + '/config/liquibase/users.csv', resourceDir + 'config/liquibase/users.csv');
        this.copy(resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
        this.copy(resourceDir + '/config/liquibase/users_authorities.csv', resourceDir + 'config/liquibase/users_authorities.csv');
    }

    if (this.databaseType == "mongodb") {
        this.copy(resourceDir + '/config/mongeez/authorities.xml', resourceDir + 'config/mongeez/authorities.xml');
        this.copy(resourceDir + '/config/mongeez/master.xml', resourceDir + 'config/mongeez/master.xml');
        this.copy(resourceDir + '/config/mongeez/users.xml', resourceDir + 'config/mongeez/users.xml');
    }

    // Create mail templates
    this.copy(resourceDir + '/mails/activationEmail.html', resourceDir + 'mails/activationEmail.html');

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
    this.template('src/main/java/package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
    if (this.databaseType == 'mongodb') {
        this.template('src/main/java/package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java', this, {});
    }
    this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
    this.template('src/main/java/package/config/_JacksonConfiguration.java', javaDir + 'config/JacksonConfiguration.java', this, {});
    this.template('src/main/java/package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
    this.template('src/main/java/package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
    this.template('src/main/java/package/config/_MailConfiguration.java', javaDir + 'config/MailConfiguration.java', this, {});
    this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});

    if (this.authenticationType == 'token') {
        this.template('src/main/java/package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
    }

    if (this.databaseType == 'mongodb' &&  this.authenticationType == 'token') {
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
    }

    this.template('src/main/java/package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
    this.template('src/main/java/package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});

    this.template('src/main/java/package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
    this.template('src/main/java/package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

    this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
    this.template('src/main/java/package/config/metrics/_DatabaseHealthIndicator.java', javaDir + 'config/metrics/DatabaseHealthIndicator.java', this, {});
    this.template('src/main/java/package/config/metrics/_JavaMailHealthIndicator.java', javaDir + 'config/metrics/JavaMailHealthIndicator.java', this, {});
    this.template('src/main/java/package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});

    if (this.hibernateCache == "hazelcast") {
        this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java', this, {});
        this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java', this, {});
    }

    this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});
    this.template('src/main/java/package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
    this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
    this.template('src/main/java/package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
    }
    this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomLocalDateSerializer.java', javaDir + 'domain/util/CustomLocalDateSerializer.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomDateTimeSerializer.java', javaDir + 'domain/util/CustomDateTimeSerializer.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomDateTimeDeserializer.java', javaDir + 'domain/util/CustomDateTimeDeserializer.java', this, {});
    this.template('src/main/java/package/domain/util/_ISO8601LocalDateDeserializer.java', javaDir + 'domain/util/ISO8601LocalDateDeserializer.java', this, {});

    this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
    this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
    this.template('src/main/java/package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});

    this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});

    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
    }
    this.template('src/main/java/package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});

    this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
    this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
    this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
    this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
    this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
    }
    this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
    this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
    this.template('src/main/java/package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
    this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
    this.template('src/main/java/package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});

    this.template('src/main/java/package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});
    this.template('src/main/java/package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
    this.template('src/main/java/package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
    this.template('src/main/java/package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
    this.template('src/main/java/package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});

    this.template('src/main/java/package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
    this.template('src/main/java/package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
    this.template('src/main/java/package/web/filter/_StaticResourcesProductionFilter.java', javaDir + 'web/filter/StaticResourcesProductionFilter.java', this, {});
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/web/filter/_CsrfCookieGeneratorFilter.java', javaDir + 'web/filter/CsrfCookieGeneratorFilter.java', this, {});
    }

    this.template('src/main/java/package/web/filter/gzip/_package-info.java', javaDir + 'web/filter/gzip/package-info.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GzipResponseHeadersNotModifiableException.java', javaDir + 'web/filter/gzip/GzipResponseHeadersNotModifiableException.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipResponseUtil.java', javaDir + 'web/filter/gzip/GZipResponseUtil.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletFilter.java', javaDir + 'web/filter/gzip/GZipServletFilter.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletOutputStream.java', javaDir + 'web/filter/gzip/GZipServletOutputStream.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletResponseWrapper.java', javaDir + 'web/filter/gzip/GZipServletResponseWrapper.java', this, {});

    this.template('src/main/java/package/web/propertyeditors/_package-info.java', javaDir + 'web/propertyeditors/package-info.java', this, {});
    this.template('src/main/java/package/web/propertyeditors/_LocaleDateTimeEditor.java', javaDir + 'web/propertyeditors/LocaleDateTimeEditor.java', this, {});

    this.template('src/main/java/package/web/rest/dto/_package-info.java', javaDir + 'web/rest/dto/package-info.java', this, {});
    this.template('src/main/java/package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java', this, {});
    this.template('src/main/java/package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java', this, {});
    this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});
    this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
    this.template('src/main/java/package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
    this.template('src/main/java/package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});
    this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});

    if (this.websocket == 'spring-websocket') {
        this.template('src/main/java/package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
        this.template('src/main/java/package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
        this.template('src/main/java/package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});
    }

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    var testResourceDir = 'src/test/resources/';
    this.mkdir(testDir);

    if (this.databaseType == "mongodb") {
        this.template('src/test/java/package/config/_MongoConfiguration.java', testDir + 'config/MongoConfiguration.java', this, {});
    }
    this.template('src/test/java/package/security/_SecurityUtilsTest.java', testDir + 'security/SecurityUtilsTest.java', this, {});
    this.template('src/test/java/package/service/_UserServiceTest.java', testDir + 'service/UserServiceTest.java', this, {});
    this.template('src/test/java/package/web/rest/_AccountResourceTest.java', testDir + 'web/rest/AccountResourceTest.java', this, {});
    this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});
    this.template('src/test/java/package/web/rest/_UserResourceTest.java', testDir + 'web/rest/UserResourceTest.java', this, {});

    this.template(testResourceDir + 'config/_application.yml', testResourceDir + 'config/application.yml', this, {});
    this.template(testResourceDir + '_logback-test.xml', testResourceDir + 'logback-test.xml', this, {});

    if (this.hibernateCache == "ehcache") {
        this.template(testResourceDir + '_ehcache.xml', testResourceDir + 'ehcache.xml', this, {});
    }

    // Create Webapp
    this.mkdir(webappDir);

    // normal CSS or SCSS?
    if (this.useCompass) {
        this.copy('src/main/scss/main.scss', 'src/main/scss/main.scss');
    } else {
        this.copy('src/main/webapp/assets/images/glyphicons-halflings.png', 'src/main/webapp/assets/images/glyphicons-halflings.png');
        this.copy('src/main/webapp/assets/images/glyphicons-halflings-white.png', 'src/main/webapp/assets/images/glyphicons-halflings-white.png');
        this.copy('src/main/webapp/assets/styles/bootstrap.css', 'src/main/webapp/assets/styles/bootstrap.css');
        this.copy('src/main/webapp/assets/styles/main.css', 'src/main/webapp/assets/styles/main.css');
        this.copy('src/main/webapp/assets/fonts/glyphicons-halflings-regular.eot', 'src/main/webapp/assets/fonts/glyphicons-halflings-regular.eot');
        this.copy('src/main/webapp/assets/fonts/glyphicons-halflings-regular.svg', 'src/main/webapp/assets/fonts/glyphicons-halflings-regular.svg');
        this.copy('src/main/webapp/assets/fonts/glyphicons-halflings-regular.ttf', 'src/main/webapp/assets/fonts/glyphicons-halflings-regular.ttf');
        this.copy('src/main/webapp/assets/fonts/glyphicons-halflings-regular.woff', 'src/main/webapp/assets/fonts/glyphicons-halflings-regular.woff');
    }

    // HTML5 BoilerPlate
    this.copy(webappDir + 'favicon.ico', webappDir + 'favicon.ico');
    this.copy(webappDir + 'robots.txt', webappDir + 'robots.txt');
    this.copy(webappDir + 'htaccess.txt', webappDir + '.htaccess');

    // install all files related to i18n
    this.installI18nFilesByLanguage(this, webappDir, resourceDir, 'en');
    this.installI18nFilesByLanguage(this, webappDir, resourceDir, 'fr');

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
    if (this.authenticationType == 'token') {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.oauth2.service.js', webappDir + 'scripts/components/auth/provider/auth.oauth2.service.js', this, {});
    } else {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.session.service.js', webappDir + 'scripts/components/auth/provider/auth.session.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/auth/services/_account.service.js', webappDir + 'scripts/components/auth/services/account.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_activate.service.js', webappDir + 'scripts/components/auth/services/activate.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_password.service.js', webappDir + 'scripts/components/auth/services/password.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_register.service.js', webappDir + 'scripts/components/auth/services/register.service.js', this, {});
    if (this.authenticationType == 'cookie') {
        this.template(webappDir + '/scripts/components/auth/services/_sessions.service.js', webappDir + 'scripts/components/auth/services/sessions.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/form/_form.directive.js', webappDir + 'scripts/components/form/form.directive.js', this, {});
    this.template(webappDir + '/scripts/components/language/_language.controller.js', webappDir + 'scripts/components/language/language.controller.js', this, {});
    this.template(webappDir + '/scripts/components/language/_language.service.js', webappDir + 'scripts/components/language/language.service.js', this, {});
    this.template(webappDir + '/scripts/components/navbar/_navbar.directive.js', webappDir + 'scripts/components/navbar/navbar.directive.js', this, {});
    this.copy(webappDir + '/scripts/components/navbar/navbar.html', webappDir + 'scripts/components/navbar/navbar.html');
    this.template(webappDir + '/scripts/components/navbar/_navbar.controller.js', webappDir + 'scripts/components/navbar/navbar.controller.js', this, {});
    this.template(webappDir + '/scripts/components/util/_base64.service.js', webappDir + 'scripts/components/util/base64.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_truncate.filter.js', webappDir + 'scripts/components/util/truncate.filter.js', this, {});

    // Client App
    this.template(webappDir + '/scripts/app/account/_account.js', webappDir + 'scripts/app/account/account.js', this, {});
    this.copy(webappDir + '/scripts/app/account/activate/activate.html', webappDir + 'scripts/app/account/activate/activate.html');
    this.template(webappDir + '/scripts/app/account/activate/_activate.js', webappDir + 'scripts/app/account/activate/activate.js', this, {});
    this.template(webappDir + '/scripts/app/account/activate/_activate.controller.js', webappDir + 'scripts/app/account/activate/activate.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/account/login/login.html', webappDir + 'scripts/app/account/login/login.html');
    this.template(webappDir + '/scripts/app/account/login/_login.js', webappDir + 'scripts/app/account/login/login.js', this, {});
    this.template(webappDir + '/scripts/app/account/login/_login.controller.js', webappDir + 'scripts/app/account/login/login.controller.js', this, {});
    this.template(webappDir + '/scripts/app/account/logout/_logout.js', webappDir + 'scripts/app/account/logout/logout.js', this, {});
    this.template(webappDir + '/scripts/app/account/logout/_logout.controller.js', webappDir + 'scripts/app/account/logout/logout.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/account/password/password.html', webappDir + 'scripts/app/account/password/password.html');
    this.template(webappDir + '/scripts/app/account/password/_password.js', webappDir + 'scripts/app/account/password/password.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.controller.js', webappDir + 'scripts/app/account/password/password.controller.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.directive.js', webappDir + 'scripts/app/account/password/password.directive.js', this, {});
    this.copy(webappDir + '/scripts/app/account/register/register.html', webappDir + 'scripts/app/account/register/register.html');
    this.template(webappDir + '/scripts/app/account/register/_register.js', webappDir + 'scripts/app/account/register/register.js', this, {});
    this.template(webappDir + '/scripts/app/account/register/_register.controller.js', webappDir + 'scripts/app/account/register/register.controller.js', this, {});
    if (this.authenticationType == 'cookie') {
        this.copy(webappDir + '/scripts/app/account/sessions/sessions.html', webappDir + 'scripts/app/account/sessions/sessions.html');
        this.template(webappDir + '/scripts/app/account/sessions/_sessions.js', webappDir + 'scripts/app/account/sessions/sessions.js', this, {});
        this.template(webappDir + '/scripts/app/account/sessions/_sessions.controller.js', webappDir + 'scripts/app/account/sessions/sessions.controller.js', this, {});
    }
    this.copy(webappDir + '/scripts/app/account/settings/settings.html', webappDir + 'scripts/app/account/settings/settings.html');
    this.template(webappDir + '/scripts/app/account/settings/_settings.js', webappDir + 'scripts/app/account/settings/settings.js', this, {});
    this.template(webappDir + '/scripts/app/account/settings/_settings.controller.js', webappDir + 'scripts/app/account/settings/settings.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/_admin.js', webappDir + 'scripts/app/admin/admin.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/audits/audits.html', webappDir + 'scripts/app/admin/audits/audits.html');
    this.template(webappDir + '/scripts/app/admin/audits/_audits.js', webappDir + 'scripts/app/admin/audits/audits.js', this, {});
    this.template(webappDir + '/scripts/app/admin/audits/_audits.controller.js', webappDir + 'scripts/app/admin/audits/audits.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/configuration/configuration.html', webappDir + 'scripts/app/admin/configuration/configuration.html');
    this.template(webappDir + '/scripts/app/admin/configuration/_configuration.js', webappDir + 'scripts/app/admin/configuration/configuration.js', this, {});
    this.template(webappDir + '/scripts/app/admin/configuration/_configuration.controller.js', webappDir + 'scripts/app/admin/configuration/configuration.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/docs/docs.html', webappDir + 'scripts/app/admin/docs/docs.html');
    this.template(webappDir + '/scripts/app/admin/docs/_docs.js', webappDir + 'scripts/app/admin/docs/docs.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/health/health.html', webappDir + 'scripts/app/admin/health/health.html');
    this.template(webappDir + '/scripts/app/admin/health/_health.js', webappDir + 'scripts/app/admin/health/health.js', this, {});
    this.template(webappDir + '/scripts/app/admin/health/_health.controller.js', webappDir + 'scripts/app/admin/health/health.controller.js', this, {});
    this.copy(webappDir + '/scripts/app/admin/logs/logs.html', webappDir + 'scripts/app/admin/logs/logs.html');
    this.template(webappDir + '/scripts/app/admin/logs/_logs.js', webappDir + 'scripts/app/admin/logs/logs.js', this, {});
    this.template(webappDir + '/scripts/app/admin/logs/_logs.controller.js', webappDir + 'scripts/app/admin/logs/logs.controller.js', this, {});
    this.template(webappDir + '/scripts/app/admin/metrics/_metrics.html', webappDir + 'scripts/app/admin/metrics/metrics.html', this, {});
    this.template(webappDir + '/scripts/app/admin/metrics/_metrics.js', webappDir + 'scripts/app/admin/metrics/metrics.js', this, {});
    this.template(webappDir + '/scripts/app/admin/metrics/_metrics.controller.js', webappDir + 'scripts/app/admin/metrics/metrics.controller.js', this, {});
    if (this.websocket == 'spring-websocket') {
        this.copy(webappDir + '/scripts/app/admin/tracker/tracker.html', webappDir + 'scripts/app/admin/tracker/tracker.html');
        this.template(webappDir + '/scripts/app/admin/tracker/_tracker.js', webappDir + 'scripts/app/admin/tracker/tracker.js', this, {});
        this.template(webappDir + '/scripts/app/admin/tracker/_tracker.controller.js', webappDir + 'scripts/app/admin/tracker/tracker.controller.js', this, {});
        this.template(webappDir + '/scripts/components/tracker/_tracker.service.js', webappDir + '/scripts/components/tracker/tracker.service.js', this, {});
    }
    this.copy(webappDir + '/scripts/app/error/error.html', webappDir + 'scripts/app/error/error.html');
    this.copy(webappDir + '/scripts/app/error/accessdenied.html', webappDir + 'scripts/app/error/accessdenied.html');
    this.template(webappDir + '/scripts/app/entities/_entity.js', webappDir + 'scripts/app/entities/entity.js', this, {});
    this.template(webappDir + '/scripts/app/error/_error.js', webappDir + 'scripts/app/error/error.js', this, {});
    this.copy(webappDir + '/scripts/app/main/main.html', webappDir + 'scripts/app/main/main.html');
    this.template(webappDir + '/scripts/app/main/_main.js', webappDir + 'scripts/app/main/main.js', this, {});
    this.template(webappDir + '/scripts/app/main/_main.controller.js', webappDir + 'scripts/app/main/main.controller.js', this, {});

    // Index page
    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.indexFile = this.engine(this.indexFile, this, {});

    // Create Test Javascript files
    var testJsDir = 'src/test/javascript/';
    this.template(testJsDir + '_karma.conf.js', testJsDir + 'karma.conf.js');
    this.template(testJsDir + 'spec/app/account/login/_loginControllerSpec.js', testJsDir + 'spec/app/account/login/loginControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/password/_passwordControllerSpec.js', testJsDir + 'spec/app/account/password/passwordControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/password/_passwordDirectiveSpec.js', testJsDir + 'spec/app/account/password/passwordDirectiveSpec.js', this, {});
    if (this.authenticationType == 'cookie') {
        this.template(testJsDir + 'spec/app/account/sessions/_sessionsControllerSpec.js', testJsDir + 'spec/app/account/sessions/sessionsControllerSpec.js', this, {});
    }
    this.template(testJsDir + 'spec/app/account/settings/_settingsControllerSpec.js', testJsDir + 'spec/app/account/settings/settingsControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/components/auth/_authServicesSpec.js', testJsDir + 'spec/components/auth/authServicesSpec.js', this, {});

    // CSS
    this.copy(webappDir + 'assets/styles/documentation.css', webappDir + 'assets/styles/documentation.css');

    // Images
    this.copy(webappDir + 'assets/images/development_ribbon.png', webappDir + 'assets/images/development_ribbon.png');
    this.copy(webappDir + 'assets/images/hipster.png', webappDir + 'assets/images/hipster.png');
    this.copy(webappDir + 'assets/images/hipster2x.png', webappDir + 'assets/images/hipster2x.png');

    var appScripts = [
        'scripts/app/app.js',
        'scripts/components/auth/auth.service.js',
        'scripts/components/auth/principal.service.js',
        'scripts/components/auth/services/account.service.js',
        'scripts/components/auth/services/activate.service.js',
        'scripts/components/auth/services/password.service.js',
        'scripts/components/auth/services/register.service.js',
        'scripts/components/form/form.directive.js',
        'scripts/components/language/language.service.js',
        'scripts/components/language/language.controller.js',
        'scripts/components/admin/audits.service.js',
        'scripts/components/admin/logs.service.js',
        'scripts/components/admin/configuration.service.js',
        'scripts/components/admin/monitoring.service.js',
        'scripts/components/navbar/navbar.directive.js',
        'scripts/components/navbar/navbar.controller.js',
        'scripts/components/util/truncate.filter.js',
        'scripts/components/util/base64.service.js',
        'scripts/app/account/account.js',
        'scripts/app/account/activate/activate.js',
        'scripts/app/account/activate/activate.controller.js',
        'scripts/app/account/login/login.js',
        'scripts/app/account/login/login.controller.js',
        'scripts/app/account/logout/logout.js',
        'scripts/app/account/logout/logout.controller.js',
        'scripts/app/account/password/password.js',
        'scripts/app/account/password/password.controller.js',
        'scripts/app/account/password/password.directive.js',
        'scripts/app/account/register/register.js',
        'scripts/app/account/register/register.controller.js',
        'scripts/app/account/settings/settings.js',
        'scripts/app/account/settings/settings.controller.js',
        'scripts/app/admin/admin.js',
        'scripts/app/admin/audits/audits.js',
        'scripts/app/admin/audits/audits.controller.js',
        'scripts/app/admin/configuration/configuration.js',
        'scripts/app/admin/configuration/configuration.controller.js',
        'scripts/app/admin/docs/docs.js',
        'scripts/app/admin/health/health.js',
        'scripts/app/admin/health/health.controller.js',
        'scripts/app/admin/logs/logs.js',
        'scripts/app/admin/logs/logs.controller.js',
        'scripts/app/admin/metrics/metrics.js',
        'scripts/app/admin/metrics/metrics.controller.js',
        'scripts/app/entities/entity.js',
        'scripts/app/error/error.js',
        'scripts/app/main/main.js',
        'scripts/app/main/main.controller.js'
        ];

    if (this.authenticationType == 'token') {
        appScripts = appScripts.concat([
            'scripts/components/auth/provider/auth.oauth2.service.js']);
    } else {
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

    var vendorScripts = [
        'bower_components/modernizr/modernizr.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
        'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-cache-buster/angular-cache-buster.js'
    ];

    if (this.websocket == 'spring-websocket') {
        vendorScripts = vendorScripts.concat([
            'bower_components/stomp-websocket/lib/stomp.js',
            'bower_components/sockjs-client/dist/sockjs.js']);
    }

    vendorScripts = vendorScripts.concat([
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/affix.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/alert.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/tooltip.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/modal.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/button.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/popover.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/carousel.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/scrollspy.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/collapse.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/tab.js']);

    this.indexFile = this.appendScripts(this.indexFile, 'scripts/vendor.js', vendorScripts);
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/app.js', appScripts);
    this.write(webappDir + 'index.html', this.indexFile);

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
    this.config.set('useCompass', this.useCompass);
    this.config.set('buildTool', this.buildTool);
    this.config.set('frontendBuilder', this.frontendBuilder);
    this.config.set('javaVersion', this.javaVersion);
};

JhipsterGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
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
